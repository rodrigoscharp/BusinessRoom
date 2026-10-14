// Image helper for prepare-portraits.mjs. Uses only macOS frameworks
// (ImageIO, CoreGraphics, Vision), so it needs no installs beyond the
// Xcode Command Line Tools that provide swiftc.
//
//   portrait-tool cutout <in> <out.png> <auto|remove|keep> [W H]
//     Loads any image macOS can read, resizes it to W x H if given, removes
//     the background with Vision when asked (auto = only if the image has
//     no transparency), writes an RGBA PNG and prints
//     "<w> <h> <x0> <y0> <x1> <y1> <alpha|removed|opaque>" (bounding box of
//     pixels with alpha > 20, top-left origin).
//
//   portrait-tool place <in.png> <out.png> <size> <scale> <tx> <ty>
//     Draws the image scaled by <scale> with its top-left corner at (tx, ty)
//     on a transparent <size> x <size> canvas and writes an RGBA PNG.

import CoreGraphics
import CoreImage
import Foundation
import ImageIO
import UniformTypeIdentifiers
import Vision

func fail(_ msg: String) -> Never {
  FileHandle.standardError.write((msg + "\n").data(using: .utf8)!)
  exit(1)
}

func load(_ path: String) -> CGImage {
  guard let src = CGImageSourceCreateWithURL(URL(fileURLWithPath: path) as CFURL, nil),
        let img = CGImageSourceCreateImageAtIndex(src, 0, nil) else { fail("cannot read image: \(path)") }
  return img
}

func save(_ img: CGImage, _ path: String) {
  guard let dst = CGImageDestinationCreateWithURL(URL(fileURLWithPath: path) as CFURL, UTType.png.identifier as CFString, 1, nil) else {
    fail("cannot write: \(path)")
  }
  CGImageDestinationAddImage(dst, img, nil)
  if !CGImageDestinationFinalize(dst) { fail("cannot write: \(path)") }
}

func context(_ w: Int, _ h: Int) -> CGContext {
  guard let ctx = CGContext(data: nil, width: w, height: h, bitsPerComponent: 8, bytesPerRow: w * 4,
                            space: CGColorSpace(name: CGColorSpace.sRGB)!,
                            bitmapInfo: CGImageAlphaInfo.premultipliedLast.rawValue) else { fail("cannot allocate \(w)x\(h)") }
  ctx.interpolationQuality = .high
  return ctx
}

// Draws img into a fresh w x h RGBA context; memory row 0 is the top row.
func rasterize(_ img: CGImage, _ w: Int, _ h: Int) -> CGContext {
  let ctx = context(w, h)
  ctx.draw(img, in: CGRect(x: 0, y: 0, width: w, height: h))
  return ctx
}

func alphaBox(_ ctx: CGContext) -> (Int, Int, Int, Int, Bool) {
  let w = ctx.width, h = ctx.height
  let px = ctx.data!.bindMemory(to: UInt8.self, capacity: w * h * 4)
  var x0 = w, y0 = h, x1 = -1, y1 = -1, opaque = true
  for y in 0..<h {
    for x in 0..<w {
      let a = px[(y * w + x) * 4 + 3]
      if a < 250 { opaque = false }
      if a > 20 { x0 = min(x0, x); x1 = max(x1, x); y0 = min(y0, y); y1 = max(y1, y) }
    }
  }
  return (x0, y0, x1, y1, opaque)
}

func removeBackground(_ img: CGImage) -> CGImage {
  guard #available(macOS 14.0, *) else { fail("background removal needs macOS 14 or newer") }
  let handler = VNImageRequestHandler(cgImage: img, options: [:])
  let req = VNGenerateForegroundInstanceMaskRequest()
  do { try handler.perform([req]) } catch { fail("Vision failed: \(error)") }
  guard let obs = req.results?.first, !obs.allInstances.isEmpty else { fail("Vision found no person in the image") }
  guard let buf = try? obs.generateMaskedImage(ofInstances: obs.allInstances, from: handler, croppedToInstancesExtent: false),
        let out = CIContext().createCGImage(CIImage(cvPixelBuffer: buf), from: CGRect(x: 0, y: 0, width: img.width, height: img.height)) else {
    fail("Vision could not cut out the image")
  }
  return out
}

// Shrinks the alpha edge by one pixel (3x3 minimum) to drop the light halo
// that the old background leaves around a cutout. Pixels are premultiplied,
// so color is scaled along with alpha.
func erodeEdge(_ ctx: CGContext) {
  let w = ctx.width, h = ctx.height
  let px = ctx.data!.bindMemory(to: UInt8.self, capacity: w * h * 4)
  var alpha = [UInt8](repeating: 0, count: w * h)
  for i in 0..<(w * h) { alpha[i] = px[i * 4 + 3] }
  for y in 0..<h {
    for x in 0..<w {
      let i = y * w + x
      let a = alpha[i]
      if a == 0 { continue }
      var m = a
      for dy in -1...1 {
        for dx in -1...1 {
          let nx = x + dx, ny = y + dy
          let n: UInt8 = (nx < 0 || ny < 0 || nx >= w || ny >= h) ? 0 : alpha[ny * w + nx]
          if n < m { m = n }
        }
      }
      if m == a { continue }
      let k = Double(m) / Double(a)
      for c in 0..<3 { px[i * 4 + c] = UInt8(Double(px[i * 4 + c]) * k) }
      px[i * 4 + 3] = m
    }
  }
}

let args = CommandLine.arguments
guard args.count >= 2 else { fail("usage: portrait-tool cutout|place ...") }

switch args[1] {
case "cutout":
  guard args.count == 5 || args.count == 7 else { fail("usage: portrait-tool cutout <in> <out.png> <auto|remove|keep> [W H]") }
  var img = load(args[2])
  if args.count == 7, let w = Int(args[5]), let h = Int(args[6]), w != img.width || h != img.height {
    img = rasterize(img, w, h).makeImage()!
  }
  var ctx = rasterize(img, img.width, img.height)
  var box = alphaBox(ctx)
  var how = box.4 ? "opaque" : "alpha"
  if args[4] == "remove" || (args[4] == "auto" && box.4) {
    img = removeBackground(img)
    ctx = rasterize(img, img.width, img.height)
    erodeEdge(ctx)
    box = alphaBox(ctx)
    how = "removed"
  }
  if box.2 < 0 { fail("image is fully transparent: \(args[2])") }
  save(ctx.makeImage()!, args[3])
  print("\(img.width) \(img.height) \(box.0) \(box.1) \(box.2) \(box.3) \(how)")

case "place":
  guard args.count == 8, let size = Int(args[4]), let s = Double(args[5]), let tx = Double(args[6]), let ty = Double(args[7]) else {
    fail("usage: portrait-tool place <in.png> <out.png> <size> <scale> <tx> <ty>")
  }
  let img = load(args[2])
  let ctx = context(size, size)
  let w = Double(img.width) * s, h = Double(img.height) * s
  // CoreGraphics puts the origin at the bottom left, so flip ty.
  ctx.draw(img, in: CGRect(x: tx, y: Double(size) - ty - h, width: w, height: h))
  save(ctx.makeImage()!, args[3])

default:
  fail("unknown command: \(args[1])")
}
