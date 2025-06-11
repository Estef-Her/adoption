import React, { useState, useRef, useEffect } from 'react';
import * as cocoSsd from '@tensorflow-models/coco-ssd';
import '@tensorflow/tfjs'; // sin versiones "core", "node" o "tfjs-backend-*"
import LoadingModal from '../LoadingModal'

const DogDetector = () => {
  const [model, setModel] = useState(null);
  const [imageSrc, setImageSrc] = useState(null);
  const [predictions, setPredictions] = useState([]);
  const imageRef = useRef(null);
  const canvasRef = useRef(null);

  // Cargar el modelo al montar el componente
  useEffect(() => {
    cocoSsd.load().then((loadedModel) => {
      setModel(loadedModel);
      console.log('Modelo COCO-SSD cargado');
    }).catch((error) => {
      console.error('Error al cargar el modelo:', error);
    });
  }, []);

  // Maneja la carga de la imagen mediante input
  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Crear una URL temporal para previsualizar la imagen
      const imageURL = URL.createObjectURL(file);
      setImageSrc(imageURL);
      // Limpiar predicciones previas
      setPredictions([]);
    }
  };

  // Ejecuta la detección de objetos sobre la imagen cargada
  const detectObjects = async () => {
    if (model && imageRef.current) {
      try {
        // Esperar a que la imagen se cargue completamente (si fuese necesario)
        await new Promise((resolve) => {
          if (imageRef.current.complete) resolve();
          else imageRef.current.onload = resolve;
        });
        // Ejecutar la detección sobre la imagen HTML
        const preds = await model.detect(imageRef.current);
        setPredictions(preds);
        console.log('Predicciones:', preds);
        drawPredictions(preds);
      } catch (error) {
        console.error('Error al detectar objetos:', error);
      }
    }
  };

  // Dibuja las predicciones en el canvas superpuesto
  const drawPredictions = (preds) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    // Asegurar que el canvas tenga el mismo tamaño que la imagen mostrada
    canvas.width = imageRef.current.width;
    canvas.height = imageRef.current.height;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    preds.forEach((prediction) => {
      if (prediction.score > 0.5) {
        const [x, y, width, height] = prediction.bbox;
        ctx.strokeStyle = '#00FFFF';
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, width, height);
        ctx.font = '16px Arial';
        ctx.fillStyle = '#00FFFF';
        ctx.fillText(
          `${prediction.class} - ${Math.round(prediction.score * 100)}%`,
          x,
          y > 10 ? y - 5 : y + 15
        );
      }
    });
  };

  return (
    <div>
      <h1>Detección de Objetos con Imagen</h1>
      <input type="file" accept="image/*" onChange={handleImageUpload} />
      
      {imageSrc && (
        <div style={{ position: 'relative', display: 'inline-block' }}>
          {/* La imagen cargada */}
          <img
            ref={imageRef}
            src={imageSrc}
            alt="Imagen para detección"
            style={{ maxWidth: '100%' }}
          />
          {/* Canvas para dibujar las predicciones, se posiciona sobre la imagen */}
          <canvas
            ref={canvasRef}
            style={{
              position: 'absolute',
              top: 0,
              left: 0
            }}
          />
        </div>
      )}
      
      {imageSrc && model && (
        <div>
          <button onClick={detectObjects}>Detectar Objetos</button>
        </div>
      )}

      {predictions.length > 0 && (
        <div>
          <h2>Resultados:</h2>
          <pre>{JSON.stringify(predictions, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default DogDetector;
