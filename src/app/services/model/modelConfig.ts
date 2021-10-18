export interface ModelConfig {
    edgeColor?: number;

    distanceFromModel: number;
    
    modelPath: string;
    modelHeight: number;
    onModelLoadProgress: (xhr: ProgressEvent<EventTarget>) => void;
    onModelLoadError: (error: ErrorEvent) => void;
    
}