import * as tmImage from '@teachablemachine/image';

class TeacheableMachine {
    constructor() {
        this.URL = 'https://teachablemachine.withgoogle.com/models/lS3pHIPWc/';  
        this.modelURL = "";
        this.metadataURL = "";
        this.model = null;
        this.loadModel();
    }
    getModel(){
        return this.model;
    }
    // Cargar el modelo al iniciar el componente
    loadModel = async () => {
        this.modelURL = this.URL + "model.json";
        this.metadataURL = this.URL + "metadata.json";

        this.model = await tmImage.load(this.modelURL, this.metadataURL);
    };

    // Ejecutar la predicción
    handlePredict = (image) => {
        return new Promise((resolve, reject) => {
            if (this.model && image) {
                const imgElement = document.createElement('img');
                imgElement.src = image;
                imgElement.onload = async () => {
                    const prediction = await this.model.predict(imgElement);
                    resolve(prediction);
                };
                imgElement.onerror = reject;
            } else {
                reject(new Error('Modelo o imagen no cargados correctamente.'));
            }
        });
    };
}

// Exportar la clase para su uso en otros archivos
export default TeacheableMachine;
