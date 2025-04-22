import * as cocoSsd from '@tensorflow-models/coco-ssd';
import '@tensorflow/tfjs'; // sin versiones "core", "node" o "tfjs-backend-*"

class DeteccionImagen {
    constructor() {  
        this.model = null;
        this.loadModel();
    }
    getModel(){
        return this.model;
    }
    // Cargar el modelo al iniciar el componente
    loadModel = async () => {
cocoSsd.load().then((loadedModel) => {
      this.model = loadedModel;
      console.log('Modelo COCO-SSD cargado');
    }).catch((error) => {
      console.error('Error al cargar el modelo:', error);
    });
    };

    // Ejecutar la predicción
    handlePredict = async (image) => {
        if (this.model && image) {
          try {
            const predictions = await this.model.detect(image);
            console.log('Predicciones:', predictions);
      
            const hasDog = predictions.some(
              (pred) => pred.class === 'dog' && pred.score >= 0.5
            );
      
            return hasDog; // Retorna true si hay un perro con score >= 0.5
          } catch (error) {
            console.error('Error al hacer la predicción:', error);
            return false;
          }
        } else {
          console.warn('Modelo o imagen no están disponibles.');
          return false;
        }
      };
      
      
}

// Exportar la clase para su uso en otros archivos
export default DeteccionImagen;