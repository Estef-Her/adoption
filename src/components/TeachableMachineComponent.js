import React, { useState } from 'react';
import * as tmImage from '@teachablemachine/image';

const TeachableMachineComponent = () => {
    const [model, setModel] = useState(null);
    const [predictions, setPredictions] = useState([]);
    const [image, setImage] = useState(null);

    const URL = "https://teachablemachine.withgoogle.com/models/lS3pHIPWc/";

    // Cargar el modelo al iniciar el componente
    useState(() => {
        const loadModel = async () => {
            const modelURL = URL + "model.json";
            const metadataURL = URL + "metadata.json";

            const loadedModel = await tmImage.load(modelURL, metadataURL);
            setModel(loadedModel);
        };

        loadModel();
    }, []);

    // Manejar la selección de la imagen
    const handleImageChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                setImage(e.target.result);
            };
            reader.readAsDataURL(file);
        }
    };

    // Ejecutar la predicción
    const handlePredict = async () => {
        if (model && image) {
            const imgElement = document.createElement('img');
            imgElement.src = image;
            imgElement.onload = async () => {
                const prediction = await model.predict(imgElement);
                setPredictions(prediction);
            };
        }
    };

    return (
        <div>
            <h1>Teachable Machine Image Model</h1>
            <input type="file" accept="image/*" onChange={handleImageChange} class="mt-3" />
            <button onClick={handlePredict} type="submit" class="mt-3">Classify Image</button>
            
            {image && <img src={image} alt="Uploaded" style={{ marginTop: '20px', maxWidth: '300px' }} />}

            <div id="label-container">
                {predictions.map((prediction, index) => (
                    <div key={index}>
                        {prediction.className}: {prediction.probability.toFixed(2)}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TeachableMachineComponent;
