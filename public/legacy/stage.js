window.createStage=function(container,kind){
 if(!window.THREE){container.innerHTML='<p style="padding:50px 25px">Không tải được mô hình. Bạn vẫn có thể đọc đủ hướng dẫn 3 bước bên cạnh.</p>';return{setStep(){},reset(){},dispose(){}};}
 const T=THREE,scene=new T.Scene();scene.background=new T.Color('#eaf0e7');
 const camera=new T.PerspectiveCamera(35,1,.1,100);camera.position.set(4.8,3.4,6);
 let renderer;try{renderer=new T.WebGLRenderer({antialias:true,alpha:false});}catch{container.innerHTML='<p style="padding:50px 25px">Thiết bị chưa hỗ trợ WebGL. Hướng dẫn văn bản vẫn sẵn sàng bên cạnh.</p>';return{setStep(){},reset(){},dispose(){}};}
 renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.outputEncoding=T.sRGBEncoding;renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;container.prepend(renderer.domElement);renderer.domElement.setAttribute('aria-label','Mô hình 3D tương tác: kéo để xoay, cuộn để phóng to');renderer.domElement.setAttribute('role','img');
 scene.add(new T.HemisphereLight('#ffffff','#8d9c80',.85));const light=new T.DirectionalLight('#ffffff',.85);light.position.set(4,8,5);light.castShadow=true;light.shadow.mapSize.set(1024,1024);scene.add(light);
 const ground=new T.Mesh(new T.CylinderGeometry(2.3,2.3,.12,80),new T.MeshStandardMaterial({color:new T.Color('#d8e2d1').convertSRGBToLinear(),roughness:.92}));ground.position.y=-1.75;ground.receiveShadow=true;scene.add(ground);
 const model=new T.Group();scene.add(model);let step=0,frame,dead=false;const parts=[[],[],[]],drops=[];const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
 function mat(color,opts={}){return new T.MeshStandardMaterial({color:new T.Color(color).convertSRGBToLinear(),roughness:.56,...opts});}
 function add(geo,color,pos,part=-1,opts={}){const m=new T.Mesh(geo,mat(color,opts));if(pos)m.position.set(...pos);m.castShadow=true;m.receiveShadow=true;model.add(m);if(part>=0)parts[part].push(m);return m;}
 function cyl(rt,rb,h,color,pos,part=-1,opts={}){return add(new T.CylinderGeometry(rt,rb,h,56),color,pos,part,opts);}
 function ball(r,color,pos,part=-1){return add(new T.SphereGeometry(r,20,16),color,pos,part);}
 function beam(a,b,r,color,part=-1){const start=new T.Vector3(...a),end=new T.Vector3(...b),direction=new T.Vector3().subVectors(end,start);const m=add(new T.CylinderGeometry(r*.8,r,direction.length(),12),color,null,part);m.position.copy(start.add(end).multiplyScalar(.5));m.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),direction.normalize());return m;}
 if(kind==='water'){
  cyl(.64,.64,.9,'#d0e6d8',[0,-1.23,0],-1,{transparent:true,opacity:.36,side:T.DoubleSide,depthWrite:false});
  cyl(.56,.56,.17,'#85b4b2',[0,-1.57,0],2,{transparent:true,opacity:.72});
  cyl(.84,.84,2.45,'#d5e7dd',[0,.61,0],-1,{transparent:true,opacity:.22,side:T.DoubleSide,depthWrite:false});
  cyl(.82,.23,.62,'#cee0d5',[0,-.88,0],-1,{transparent:true,opacity:.25,depthWrite:false});
  cyl(.24,.24,.22,'#648973',[0,-1.28,0]);
  const cloth=cyl(.57,.27,.18,'#f7f1dc',[0,-.73,0],0);cloth.rotation.z=.06;
  cyl(.78,.58,.38,'#343a34',[0,-.43,0],0);
  cyl(.79,.79,.69,'#ceae70',[0,.10,0],1);
  for(let i=0;i<28;i++){const a=i*2.3999,r=Math.sqrt((i+.5)/28)*.62;const m=ball(.11+(i%3)*.025,['#909c8b','#b8b9a3','#788274'][i%3],[Math.cos(a)*r,.58+(i%3)*.055,Math.sin(a)*r],1);m.scale.y=.65;}
  cyl(.78,.78,.24,'#9aa88a',[0,.99,0],2,{transparent:true,opacity:.55});
  for(let i=0;i<7;i++){const d=ball(.032,'#3f9796',[0,-1.3-i*.09,0],2);drops.push(d);}
 }else if(kind==='fire'){
  for(let i=0;i<11;i++){const a=i/11*Math.PI*2;const s=ball(.31,'#919887',[Math.cos(a)*1.45,-1.45,Math.sin(a)*1.45]);s.scale.y=.65;}
  for(let i=0;i<15;i++){const a=i*2.399;beam([Math.cos(a)*.6,-1.5,Math.sin(a)*.6],[Math.sin(a)*.3,-1.31,Math.cos(a)*.4],.035,'#c9ac69',0);}
  for(let i=0;i<8;i++){const a=i/8*Math.PI*2;beam([Math.cos(a),-1.5,Math.sin(a)],[Math.cos(a+.5)*.2,.65,Math.sin(a+.5)*.2],.13,'#765333',1);}
  for(let i=0;i<5;i++){const f=add(new T.ConeGeometry(.24+i*.025,1.3,9),'#e9a346',[(i-2)*.12,-.72,0],2,{emissive:'#a85717',emissiveIntensity:.5});f.rotation.z=(i-2)*.12;drops.push(f);}
 }else if(kind==='watch'){
  add(new T.BoxGeometry(.82,.12,3.3),'#6c7b60',[0,-.6,0]);const face=cyl(1.1,1.1,.22,'#d5d7c7',[0,-.39,0]);
  cyl(.98,.98,.04,'#fbfaf2',[0,-.25,0]);
  for(let i=0;i<12;i++){const a=i/12*Math.PI*2;const tick=add(new T.BoxGeometry(.04,.035,.14),'#485c4c',[Math.sin(a)*.81,-.21,Math.cos(a)*.81]);tick.rotation.y=a;}
  beam([0,-.18,0],[.45,-.18,.48],.03,'#b36838',1);beam([0,-.18,0],[0,-.18,-.72],.024,'#445748');ball(.07,'#485849',[0,-.15,0]);
  beam([0,-.12,0],[.85,-.12,-.95],.025,'#25836b',2);const arrow=add(new T.ConeGeometry(.13,.3,3),'#25836b',[.85,-.12,-.95],2);arrow.rotation.x=-Math.PI/2;arrow.rotation.z=-.7;
  ball(.3,'#e8be69',[1.8,1.8,0],1);
 }else if(kind==='jar'){
  cyl(.82,.82,1.65,'#e1e6db',[0,-.62,0],-1,{transparent:true,opacity:.26,depthWrite:false});
  cyl(.74,.74,1.1,'#a85645',[0,-.8,0],0,{roughness:.45});
  for(let i=0;i<9;i++)ball(.13,'#a33b38',[Math.sin(i*2.4)*.45,-.2,Math.cos(i*2.4)*.45],0);
  const lid=cyl(.89,.89,.19,'#d3b269',[0,.34,0]);parts[2].push(lid);lid.userData.isLid=true;
  const band=add(new T.TorusGeometry(.88,.065,10,60),'#708b69',[0,.32,0],1);band.rotation.x=Math.PI/2;
 }else if(kind==='bottle'){
  cyl(.61,.61,2.1,'#9fc2b4',[0,-.45,0],-1,{transparent:true,opacity:.6,roughness:.2});cyl(.25,.6,.38,'#9fc2b4',[0,.8,0]);cyl(.25,.25,.3,'#dce5d1',[0,1.1,0]);
  const wrap=cyl(.63,.63,1.15,'#eeeade',[0,-.4,0],0);cyl(1.3,1.1,.6,'#b6c4b9',[0,-1.38,0],1,{transparent:true,opacity:.6});
  for(let i=0;i<12;i++){const a=i*2.399;const ice=add(new T.BoxGeometry(.25,.24,.25),'#e0eeee',[Math.sin(a)*.9,-1.05+(i%2)*.08,Math.cos(a)*.9],1,{transparent:true,opacity:.8});ice.rotation.y=a;}
  for(let i=0;i<6;i++){const ring=add(new T.TorusGeometry(.78+i*.04,.015,8,60),'#9bbcb0',[0,-.8+i*.32,0],2);ring.rotation.x=Math.PI/2;}
 }else if(kind==='cable'){
  for(let i=0;i<5;i++){const ring=add(new T.TorusGeometry(.91,.047,10,80),'#e5e4d6',[0,-.7+i*.1,0],0);ring.rotation.x=Math.PI/2;parts[1].push(ring);}
  beam([.9,-.45,0],[1.35,.1,0],.048,'#dadbce');add(new T.BoxGeometry(.24,.46,.14),'#d2d7ca',[1.35,.28,0]);add(new T.BoxGeometry(.18,.18,.09),'#7f8b80',[1.35,.6,0]);
  add(new T.BoxGeometry(.31,.58,.29),'#8caa84',[-.9,-.5,0],2);
 }else if(kind==='shelter'){
  beam([-1.5,-1.6,0],[0,.9,0],.065,'#6e6145',0);beam([1.5,-1.6,0],[0,.9,0],.065,'#6e6145',0);
  const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute([-1.5,-1.5,-1,0,.9,0,-1.5,-1.5,1,1.5,-1.5,-1,1.5,-1.5,1,0,.9,0,-1.5,-1.5,-1,1.5,-1.5,-1,0,.9,0],3));g.computeVertexNormals();add(g,'#a1ad7b',null,1,{side:T.DoubleSide});
  add(new T.BoxGeometry(2,.08,1.4),'#c6ba91',[0,-1.55,.2],2);
 }else{
  add(new T.BoxGeometry(2.3,.8,1.5),'#e8e5d7',[0,-.7,0]);add(new T.BoxGeometry(.32,.05,.93),'#aa5a4f',[0,-.27,0],0);add(new T.BoxGeometry(.93,.05,.32),'#aa5a4f',[0,-.27,0],0);
  beam([-1.4,-1.1,.9],[1.4,-1.1,.9],.08,'#a18c62',1);for(let i=0;i<3;i++)add(new T.BoxGeometry(.16,.4,.3),'#c8bc9d',[-.7+i*.7,-.8,.9],2);
 }
 const controls=new T.OrbitControls(camera,renderer.domElement);controls.enableDamping=true;controls.enablePan=false;controls.minDistance=4;controls.maxDistance=13;controls.maxPolarAngle=Math.PI*.77;controls.target.set(0,-.1,0);controls.autoRotate=false;
 function update(){for(let i=0;i<3;i++)for(const m of parts[i]){m.visible=i<=step;if(m.userData.isLid){m.visible=true;m.position.y=step===2?1.15:.34;m.rotation.y=step===2?1:0;}}}
 function size(){const w=container.clientWidth,h=container.clientHeight;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();}const observer=new ResizeObserver(size);observer.observe(container);size();update();
 function loop(t){if(dead)return;frame=requestAnimationFrame(loop);controls.update();if(!reduced&&step===2){drops.forEach((d,i)=>{if(kind==='water')d.position.y=-1.25-((t/1100+i*.12)%.5);else if(kind==='fire')d.scale.y=.85+Math.sin(t/280+i)*.15;});}renderer.render(scene,camera);}frame=requestAnimationFrame(loop);
 return{setStep(n){step=n;update();},reset(){camera.position.set(4.8,3.4,6);controls.target.set(0,-.1,0);controls.update();},dispose(){dead=true;cancelAnimationFrame(frame);observer.disconnect();controls.dispose();scene.traverse(o=>{o.geometry?.dispose();if(o.material)for(const m of(Array.isArray(o.material)?o.material:[o.material]))m.dispose();});renderer.dispose();renderer.domElement.remove();}};
};
