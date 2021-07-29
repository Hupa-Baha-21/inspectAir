import { Component, OnInit } from '@angular/core';
import { ACESFilmicToneMapping, AmbientLight, Camera, DirectionalLight, DirectionalLightHelper, EquirectangularReflectionMapping, FloatType, Group, LinearToneMapping, Object3D, PerspectiveCamera, Raycaster, RepeatWrapping, Scene, sRGBEncoding, TextureLoader, Vector2, Vector3, WebGLRenderer } from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { OutlinePass } from 'three/examples/jsm/postprocessing/OutlinePass.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  private renderer? : WebGLRenderer;
  private scene : Scene;
  private loader : GLTFLoader;
  private camera : Camera;

  private model? : Object3D;

  private controls? : OrbitControls;
  private raycaster : Raycaster;

  //test me daddy
  private composer? : EffectComposer;
  private outlinePass? : OutlinePass;

  private parts? : Object3D[];

  constructor () {  
    this.scene = new Scene();
    this.loader = new GLTFLoader();
    this.camera = new PerspectiveCamera(75, window.innerWidth/window.innerHeight, .1, 20);
    this.raycaster = new Raycaster();

    this.camera.position.setZ(5);

    this.setupLights();

    new TextureLoader()
      .load('assets/env.jpg', texture => {
        texture.mapping = EquirectangularReflectionMapping;

        this.scene.background = texture;
      });
    // // new TextureLoader()
    // //   .load('assets/light.jpg', texture => {
    // //     texture.mapping = EquirectangularReflectionMapping;

    // //     // this.scene.background = texture;
    // //     this.scene.environment = texture;
    // //   });
    new RGBELoader()
      .setDataType(FloatType)
      .load('assets/light.hdr', texture => {
        texture.mapping = EquirectangularReflectionMapping;

        this.scene.environment = texture;
      });
  }
  
  ngOnInit(): void {
    const canvas = <HTMLCanvasElement> document.querySelector('#view');
    const that = this;
    
    this.renderer = new WebGLRenderer({
      canvas: canvas,
      alpha: true,
      // antialias: true
    });
    this.renderer.outputEncoding = sRGBEncoding;
    this.renderer.setPixelRatio(3);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.toneMapping = ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.8;

    this.controls = new OrbitControls(this.camera, canvas);
    this.controls.update();

    //test
    this.composer = new EffectComposer(this.renderer);
    this.composer.addPass(new RenderPass(this.scene, this.camera));
    this.outlinePass = new OutlinePass( new Vector2(window.innerWidth, window.innerHeight), this.scene, this.camera);
    this.outlinePass.visibleEdgeColor.setHex(0xb00020);
    this.outlinePass.edgeStrength = 4;
    this.composer.addPass(this.outlinePass);
    
    this.loader.load( 'assets/oil_purifier_DE_second.glb', function ( gltf ) {
      that.model = gltf.scene;
      that.model.position.setY(-1.5);
      
      that.scene.add(that.model);
      that.animate();
      that.parts = that.extractChildren(that.model);
      
    }, function ( xhr ) {
      console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
    }, function ( error ) {
      console.error( error );
    } );

    document.addEventListener( 'mousemove', event => this.onDocumentMouseHover(event), false );
    document.addEventListener( 'mousedown', event => this.onDocumentMouseDown(event), false );
  }

  private extractChildren(model : Object3D) : Object3D[] {
    let children : Object3D[] = [];

    model.children.forEach(child => {
      if (child.children.length) {
        children = children.concat(this.extractChildren(child));
      } else {
        children.push(child);
      }
    });

    return children;
  }

  private onDocumentMouseDown( event: any ) {
    alert (this.outlinePass?.selectedObjects[0].name);
  }

  private onDocumentMouseHover( event: any ) {
    event.preventDefault();
    const mouseX = ( event.clientX / window.innerWidth ) * 2 - 1;
    const mouseY = - ( event.clientY / window.innerHeight ) * 2 + 1;
  
    this.raycaster.setFromCamera({ x: mouseX, y: mouseY}, this.camera);

    if (!this.model || !this.outlinePass || !this.parts) {
      return;
    }

    const intersects = this.raycaster.intersectObjects( this.parts );

    if ( intersects.length > 0 ) {
      const topObj = intersects[0].object;

      if (topObj.parent !== this.model) {
        this.outlinePass.selectedObjects = [topObj.parent ?? topObj];
      } else {
        this.outlinePass.selectedObjects = [topObj];
      }
    } else {
      this.outlinePass.selectedObjects = [];
    }
}

  private setupLights() {
    const light = new AmbientLight(0xffffff, 1.5);
    const directionalLight1 = new DirectionalLight( 0xffffff, 0.7 );
    directionalLight1.position.set(0, 2, 0);
    directionalLight1.lookAt(0, 0, 0);
    
    const directionalLight2 = new DirectionalLight( 0xffffff, 0.5 );
    directionalLight2.position.set(2, 0, 0);
    directionalLight2.lookAt(0, 0, 0);
    const directionalLight3 = new DirectionalLight( 0xffffff, 0.5 );
    directionalLight3.position.set(-2, 0, 0);
    directionalLight3.lookAt(0, 0, 0);
    const directionalLight4 = new DirectionalLight( 0xffffff, 0.5 );
    directionalLight4.position.set(0, 0, 2.5);
    directionalLight4.lookAt(0, 0, 0);
    const directionalLight5 = new DirectionalLight( 0xffffff, 0.5 );
    directionalLight5.position.set(0, 0, -2);
    directionalLight5.lookAt(0, 0, 0);
    
    this.scene.add(light);
    // this.scene.add(directionalLight1);
    // this.scene.add(directionalLight2);
    // this.scene.add(directionalLight3);
    // this.scene.add(directionalLight4);
    // this.scene.add(directionalLight5);
  }

  private animate() {
    requestAnimationFrame(this.animate.bind(this));
    
    this.controls?.update();
    this.composer?.render();
  }
}
