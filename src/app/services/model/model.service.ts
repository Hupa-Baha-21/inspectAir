import { EventEmitter, Injectable } from '@angular/core';
import { ACESFilmicToneMapping, Camera, EquirectangularReflectionMapping, Object3D, PerspectiveCamera, Raycaster, Scene, sRGBEncoding, TextureLoader, Vector2, WebGLRenderer } from 'three';
import { GLTF, GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { OutlinePass } from 'three/examples/jsm/postprocessing/OutlinePass.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { ModelConfig } from './modelConfig';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class ModelService {
  public partSelect: EventEmitter<string>;
  public disableRaycasting: boolean;

  private modelLoader : GLTFLoader;
  private rgbeLoader : RGBELoader;
  private textureLoader : TextureLoader;
  
  private scene : Scene;
  private camera : Camera;
  private raycaster : Raycaster;

  private controls? : OrbitControls;
  private composer? : EffectComposer;
  private model? : Object3D;
  private parts : Object3D[];

  constructor() {
    this.partSelect = new EventEmitter<string>();
    this.disableRaycasting = false;
    
    this.modelLoader = new GLTFLoader();
    this.rgbeLoader = new RGBELoader();
    this.textureLoader = new TextureLoader();

    this.scene = new Scene();
    this.camera = new PerspectiveCamera(75, window.innerWidth/window.innerHeight, .1, 30);
    this.raycaster = new Raycaster();

    this.parts = [];
  }

  public createModelView(canvas: HTMLCanvasElement, config: ModelConfig): Observable<boolean> {
    let isLoaded = new BehaviorSubject<boolean>(false);

    this.initScene(config);

    const renderer = this.setupRenderer(canvas, config);
    const outlinePass = this.setupOutlinePass(config);

    this.composer = this.setupComposer(renderer, outlinePass);
    this.controls = this.setupControls(canvas);

    this.loadModel(config, isLoaded);
    this.setupDomEvents(outlinePass);

    return isLoaded;
  }

  private initScene(config: ModelConfig) {
    this.scene.clear();
    this.camera.position.setZ(config.distanceFromModel);
  }

  private setupRenderer(canvas: HTMLCanvasElement, config: ModelConfig) : WebGLRenderer {
    const renderer = new WebGLRenderer({
      canvas: canvas,
      alpha: true
    });
    renderer.outputEncoding = sRGBEncoding;
    renderer.setPixelRatio(2);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.toneMapping = ACESFilmicToneMapping;
    renderer.toneMappingExposure = 2; // for outline

    return renderer;
  }

  private setupControls(canvas: HTMLCanvasElement): OrbitControls {
    const controls = new OrbitControls(this.camera, canvas);
    controls.update();
    controls.maxDistance = 15;
    controls.minDistance = 2.2;
    controls.panSpeed = 0.4;

    return controls;
  }

  private setupOutlinePass(config: ModelConfig): OutlinePass {
    const outlinePass = new OutlinePass( new Vector2(window.innerWidth, window.innerHeight), this.scene, this.camera);
    outlinePass.visibleEdgeColor.setHex(config.edgeColor ?? 0xffffff);
    outlinePass.edgeStrength = 4;

    return outlinePass;
  }

  private setupComposer(renderer: WebGLRenderer, outlinePass: OutlinePass): EffectComposer {
    const composer = new EffectComposer(renderer);
    const pass = new RenderPass(this.scene, this.camera);
    composer.addPass(pass);
    composer.addPass(outlinePass);

    return composer;
  }

  private loadModel(config: ModelConfig, isLoaded: BehaviorSubject<boolean>) {
    this.modelLoader.load(config.modelPath, 
    gltf =>  this.onModelLoad(gltf, config, isLoaded), 
      config.onModelLoadProgress, 
      config.onModelLoadError
    );
  }

  private onModelLoad(gltf: GLTF, config: ModelConfig, isLoaded: BehaviorSubject<boolean>) {
    this.model = gltf.scene;
    this.model.position.setY(-config.modelHeight);
        
    this.scene.add(this.model);
    this.animate();
    this.parts = this.extractChildren(this.model);

    isLoaded.next(true);
    isLoaded.complete();
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

  private animate() {
    requestAnimationFrame(this.animate.bind(this));
    
    this.controls?.update();
    this.composer?.render();
  }

  private setupDomEvents(outlinePass: OutlinePass) {
    document.addEventListener( 'mousemove', event => this.onDocumentMouseHover(event, outlinePass), false);
    document.addEventListener( 'mousedown', event => this.onDocumentMouseDown(event, outlinePass), false);
  }

  private onDocumentMouseDown(event: any, outlinePass: OutlinePass) {
     if (outlinePass.selectedObjects.length && !event.button) {
       this.partSelect.emit(outlinePass.selectedObjects[0].name);
     }
  }

  private onDocumentMouseHover(event: any, outlinePass: OutlinePass) {
    if (!this.model || !this.parts || this.disableRaycasting) {
      if (this.disableRaycasting) {
        outlinePass.selectedObjects = [];
      }
      
      return;
    }

    event.preventDefault();
    const mouseX = ( event.clientX / window.innerWidth ) * 2 - 1;
    const mouseY = - ( event.clientY / window.innerHeight ) * 2 + 1;
  
    this.raycaster.setFromCamera({ x: mouseX, y: mouseY}, this.camera);

    const intersects = this.raycaster.intersectObjects( this.parts );

    if ( intersects.length > 0 ) {
      const topObj = intersects[0].object;

      if (topObj.parent !== this.model) {
        outlinePass.selectedObjects = [topObj.parent ?? topObj];
      } else {
        outlinePass.selectedObjects = [topObj];
      }
    } else {
      outlinePass.selectedObjects = [];
    }
  }

  public setHdrEnvironment(path: string) {
    this.rgbeLoader.load(path, texture => {
      texture.mapping = EquirectangularReflectionMapping;
      this.scene.environment = texture;
      texture.dispose();
    });
  }

  public setHdrBackground(path: string) {
    this.rgbeLoader.load(path, texture => {
      texture.mapping = EquirectangularReflectionMapping;
      this.scene.background = texture;
      texture.dispose();
   });
  }

  public setLdrEnvironment(path: string) {
    this.textureLoader.load(path, texture => {
      texture.mapping = EquirectangularReflectionMapping;
      this.scene.environment = texture;
      texture.dispose();
    });
  }

  public setLdrBackground(path: string) {
    this.textureLoader.load(path, texture => {
      texture.mapping = EquirectangularReflectionMapping;
      this.scene.background = texture;
      texture.dispose();
    });
  }
}
