
import ReactDOM from 'react-dom/client';
import { Canvas } from '@react-three/fiber';
import Experience from './seccion1_experience.jsx';
import * as THREE from 'three';


const Seccion1Canvas = () => {
  return <>

    

    <Canvas
      dpr={[0.5, 1]}
      style={{
        height: '100%', 
        width: '100vw',
       /*  backgroundColor: '#0D0E26', */
        
      }}
      performance={{
        current: 1,
        min: 0.1,
        max: 1,
        debounce: 200,
        regress: 0.5
      }}
     /*  shadows */
      gl={{
        antialias: false,
        alpha: true,
        powerPreference: "high-performance",
        stencil: false,
        depth: false,
        toneMapping: THREE.NoToneMapping,
        toneMappingExposure: 0.6,
        gammaOutput: true,
        outputColorSpace: THREE.SRGBColorSpace,
      }}
      
      >
      <Experience />
    </Canvas>
    </>
  
};

export default Seccion1Canvas;
