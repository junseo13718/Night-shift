// MediaPipe uses image coordinates: x right, y down and negative z toward the camera.
// Build a face normal from cheeks and forehead/chin so translation and head roll
// do not act like looking around. Y is converted to the same scale as X and Z.
export function faceAngles(points, aspect=4/3){
  if(!points?.[454]||!points?.[234]||!points?.[10]||!points?.[152])return null;
  const delta=(a,b)=>({x:points[a].x-points[b].x,y:(points[a].y-points[b].y)/aspect,z:points[a].z-points[b].z});
  const h=delta(454,234),v=delta(10,152);
  let x=h.y*v.z-h.z*v.y,y=h.z*v.x-h.x*v.z,z=h.x*v.y-h.y*v.x;
  const length=Math.hypot(x,y,z);if(!Number.isFinite(length)||length<1e-6)return null;
  x/=length;y/=length;z/=length;
  if(z>0){x=-x;y=-y;z=-z;}
  return {yaw:Math.atan2(x,-z),pitch:Math.atan2(-y,Math.hypot(x,z))};
}

export class HeadLook{
  constructor(){this.reset();}
  reset(){this.center=null;this.samples=[];this.filtered=null;this.lastTime=null;this.lastSeen=null;this.ready=false;}
  suspend(){this.filtered=null;this.lastTime=null;}
  get progress(){return Math.min(1,this.samples.length/15);}
  update(pose,now){
    const dt=this.lastTime===null?0:Math.max(0,Math.min(.15,(now-this.lastTime)/1000));this.lastTime=now;
    if(!pose||!Number.isFinite(pose.yaw)||!Number.isFinite(pose.pitch)){this.filtered=null;if(!this.ready)this.samples=[];return{yaw:0,pitch:0};}
    this.lastSeen=now;
    if(!this.ready){
      const first=this.samples[0];
      if(first&&(Math.abs(pose.yaw-first.yaw)>.08||Math.abs(pose.pitch-first.pitch)>.08))this.samples=[];
      this.samples.push({...pose});
      if(this.samples.length>=15){this.center={yaw:this.samples.reduce((a,p)=>a+p.yaw,0)/15,pitch:this.samples.reduce((a,p)=>a+p.pitch,0)/15};this.ready=true;this.filtered={yaw:0,pitch:0};}
      return{yaw:0,pitch:0};
    }
    const relative={yaw:pose.yaw-this.center.yaw,pitch:pose.pitch-this.center.pitch};
    if(!this.filtered){this.filtered={...relative};return{yaw:0,pitch:0};}
    const alpha=1-Math.exp(-dt*12);
    for(const axis of ['yaw','pitch'])this.filtered[axis]+=(relative[axis]-this.filtered[axis])*alpha;
    const rate=(angle,gain,max)=>Math.abs(angle)<=.065?0:Math.sign(angle)*Math.min(max,(Math.abs(angle)-.065)*gain);
    return{yaw:rate(this.filtered.yaw,4.5,1.8)*dt,pitch:rate(this.filtered.pitch,4,1.3)*dt};
  }
}
