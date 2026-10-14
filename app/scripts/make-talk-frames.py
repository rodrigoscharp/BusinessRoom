"""Make blink, mid and open frames from a cartoon portrait's base frame, for portraits whose
generator cannot edit an image. Finds the eye whites and the lips, then paints eyelids and an
open mouth. Standard library only.
Usage: python3 -I app/scripts/make-talk-frames.py <key>-base.png <out dir> <key>
Then encode each PNG: cwebp -q 96 -alpha_q 100 -sharp_yuv in.png -o app/public/portraits/<key>-<frame>.webp"""
import sys, zlib, struct, math
from collections import deque

def read(p):
    d=open(p,'rb').read(); i=8; idat=b''
    while i<len(d):
        n,=struct.unpack('>I',d[i:i+4]); t=d[i+4:i+8]; c=d[i+8:i+8+n]; i+=12+n
        if t==b'IHDR': w,h,bd,ct=struct.unpack('>IIBB',c[:10])
        elif t==b'IDAT': idat+=c
    bpp={6:4,2:3}[ct]; raw=zlib.decompress(idat); px=[]; prev=bytearray(w*bpp); o=0
    for y in range(h):
        f=raw[o]; o+=1; line=bytearray(raw[o:o+w*bpp]); o+=w*bpp
        for x in range(len(line)):
            a=line[x-bpp] if x>=bpp else 0; b=prev[x]; c=prev[x-bpp] if x>=bpp else 0
            if f==1: line[x]=(line[x]+a)&255
            elif f==2: line[x]=(line[x]+b)&255
            elif f==3: line[x]=(line[x]+(a+b)//2)&255
            elif f==4:
                pp=a+b-c; pa,pb,pc=abs(pp-a),abs(pp-b),abs(pp-c)
                line[x]=(line[x]+(a if pa<=pb and pa<=pc else b if pb<=pc else c))&255
        prev=line
        px.append([list(line[x*bpp:x*bpp+4]) if bpp==4 else list(line[x*3:x*3+3])+[255] for x in range(w)])
    return w,h,px

def write(p,w,h,px):
    raw=b''.join(b'\x00'+bytes(v for x in range(w) for v in px[y][x]) for y in range(h))
    def chunk(t,c): return struct.pack('>I',len(c))+t+c+struct.pack('>I',zlib.crc32(t+c)&0xffffffff)
    open(p,'wb').write(b'\x89PNG\r\n\x1a\n'+chunk(b'IHDR',struct.pack('>IIBBBBB',w,h,8,6,0,0,0))+chunk(b'IDAT',zlib.compress(raw,9))+chunk(b'IEND',b''))

def comps(w,h,mask):
    seen=set(); out=[]
    for (x,y) in mask:
        if (x,y) in seen: continue
        q=deque([(x,y)]); seen.add((x,y)); pts=[]
        while q:
            a,b=q.popleft(); pts.append((a,b))
            for da,db in ((1,0),(-1,0),(0,1),(0,-1)):
                n=(a+da,b+db)
                if n in mask and n not in seen: seen.add(n); q.append(n)
        out.append(pts)
    return out

def blend(px,x,y,col,a):
    if not(0<=y<len(px) and 0<=x<len(px[0])) or a<=0: return
    p=px[y][x]
    for i in range(3): p[i]=round(p[i]*(1-a)+col[i]*a)

def ellipse(px,cx,cy,rx,ry,col,ss=3,clip=None):
    for y in range(int(cy-ry)-1,int(cy+ry)+2):
        for x in range(int(cx-rx)-1,int(cx+rx)+2):
            cov=0
            for sy in range(ss):
                for sx in range(ss):
                    u=(x+(sx+.5)/ss-cx)/rx; v=(y+(sy+.5)/ss-cy)/ry
                    if u*u+v*v<=1 and (clip is None or clip(x+(sx+.5)/ss,y+(sy+.5)/ss)): cov+=1
            blend(px,x,y,col,cov/(ss*ss))

base,outdir,key=sys.argv[1:4]
w,h,px=read(base)
alpha=lambda x,y: px[y][x][3]
# the eye whites: bright, unsaturated pixels inside the figure, in the upper half
white={(x,y) for y in range(int(h*.12),int(h*.6)) for x in range(w)
       if px[y][x][3]>200 and min(px[y][x][:3])>205 and max(px[y][x][:3])-min(px[y][x][:3])<30}
cs=sorted(comps(w,h,white),key=len,reverse=True)
big=cs[0:2]
# the two biggest white blobs anchor the eyes; every white blob near the same height joins its eye
anc=sorted([(sum(p[0] for p in c)/len(c), sum(p[1] for p in c)/len(c)) for c in big])
assert len(anc)==2 and abs(anc[1][0]-anc[0][0])>30, anc
mid=(anc[0][0]+anc[1][0])/2; dd=anc[1][0]-anc[0][0]
eyes=[]
for side in (0,1):
    ax,ay=anc[side]
    pts=[(x,y) for y in range(int(ay-dd*.3),int(ay+dd*.3)) for x in range(int(ax-dd*.42),int(ax+dd*.42))
         if ((x<mid) if side==0 else (x>=mid)) and px[y][x][3]>200 and min(px[y][x][:3])>172 and max(px[y][x][:3])-min(px[y][x][:3])<20]
    xs=[p[0] for p in pts]; ys=[p[1] for p in pts]
    eyes.append(dict(x0=min(xs),x1=max(xs),y0=min(ys),y1=max(ys),n=len(pts)))
for e in eyes: e['cx']=(e['x0']+e['x1'])/2; e['cy']=(e['y0']+e['y1'])/2; e['rx']=(e['x1']-e['x0'])/2*1.12+3; e['ry']=(e['y1']-e['y0'])/2*1.15+3
d=eyes[1]['cx']-eyes[0]['cx']; ecx=(eyes[0]['cx']+eyes[1]['cx'])/2; ecy=(eyes[0]['cy']+eyes[1]['cy'])/2
# the lips: reddish pixels below the nose, between the eyes
lips=[(x,y) for y in range(int(ecy+d*.55),min(h,int(ecy+d*1.5))) for x in range(int(ecx-d*.6),int(ecx+d*.6))
      if px[y][x][3]>200 and px[y][x][0]-px[y][x][2]>55 and px[y][x][0]-px[y][x][1]>38 and sum(px[y][x][:3])<560]
# keep the lower cluster (the nose tip can be reddish too)
if lips:
    ys=sorted(p[1] for p in lips); cut=ys[len(ys)//3]
    low=[p for p in lips if p[1]>=cut] or lips
    mx=sum(p[0] for p in low)/len(low); my=sum(p[1] for p in low)/len(low)
    mw=max(p[0] for p in low)-min(p[0] for p in low)
else:
    mx,my,mw=ecx,ecy+d*1.05,d*.7
mw=max(min(mw,d*0.95),d*.45)
print(key,'eyes',[(round(e['cx']),round(e['cy']),round(e['rx']),round(e['ry'])) for e in eyes],'mouth',round(mx),round(my),round(mw))

def skin_above(e):
    ys=[int(e['y0']-e['ry']*0.6)-k for k in range(3)]
    cols=[px[y][int(e['cx'])+dx][:3] for y in ys for dx in (-4,0,4)]
    return [sum(c[i] for c in cols)//len(cols) for i in range(3)]

import copy
# blink: skin eyelids over the whites, a dark lash line across the middle
b=copy.deepcopy(px)
for e in eyes:
    sk=skin_above(e)
    ellipse(b,e['cx'],e['cy'],e['rx']+1,e['ry']+1,sk)
    shade=[round(v*.82) for v in sk]
    ellipse(b,e['cx'],e['cy']+e['ry']*.15,e['rx']*.98,e['ry']*.55,shade,clip=lambda X,Y,e=e:Y>e['cy']+e['ry']*.15)
    ellipse(b,e['cx'],e['cy']+e['ry']*.15,e['rx']*.95,max(1.6,e['ry']*.09),(40,26,22))
write(f"{outdir}/{key}-blink.png",w,h,b)
# mid and open: a dark mouth with a bit of upper teeth and a tongue
for name,k in (('mid',.2),('open',.34)):
    m=copy.deepcopy(px)
    rx=mw*(.3 if name=='mid' else .36); ry=mw*k*.5
    cy=my+ry*.35
    ellipse(m,mx,cy,rx+1.5,ry+1.5,(150,70,70))
    ellipse(m,mx,cy,rx,ry,(58,16,22))
    ellipse(m,mx,cy-ry*.72,rx*.72,ry*.32,(245,242,236),clip=lambda X,Y,cy=cy,ry=ry:Y<cy-ry*.45 and ((X-mx)/rx)**2+((Y-cy)/ry)**2<=.92)
    ellipse(m,mx,cy+ry*.55,rx*.55,ry*.42,(200,92,98),clip=lambda X,Y,cy=cy,ry=ry:((X-mx)/rx)**2+((Y-cy)/ry)**2<=.9)
    write(f"{outdir}/{key}-{name}.png",w,h,m)
