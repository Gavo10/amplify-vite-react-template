import { useState, useRef } from 'react';
import './App.css'; // Importa el archivo CSS

export const App = () => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    setFile(selectedFile);
    setResult(null);
    if (selectedFile) {
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result as string);
      reader.readAsDataURL(selectedFile);
    } else {
      setPreview(null);
    }
  };

  const handleClear = () => {
    setFile(null);
    setPreview(null);
    setResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleProcess = async () => {
    setLoading(true);
    setResult(null);
    try {
      if (!file) {
        alert('Por favor, selecciona una imagen.');
        setLoading(false);
        return;
      }

      // Convertir la imagen a base64
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Image = reader.result?.split(',')[1];

        // Enviar la petición a la API
        const response = await fetch('https://8a8ya4p021.execute-api.us-east-2.amazonaws.com/predict', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ image: base64Image }), // Enviar la imagen en base64 dentro de un JSON
        });

        if (!response.ok) {
          throw new Error(`Error al procesar la imagen: ${response.status}`);
        }
        const data = await response.json();
        setResult(JSON.stringify(data, null, 2));
      };
      reader.onerror = () => {
        setResult('Error al leer la imagen.');
        setLoading(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      setResult(`Ocurrió un error al procesar la imagen: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const CLASS_NAMES = ['adenocarcinoma', 'large.cell.carcinoma', 'normal', 'notumor', 'squamous.cell.carcinoma'];

  // Función para mostrar las probabilidades
  const renderProbabilities = () => {
    try {
      if (!result) return null;
      const data = JSON.parse(result);
      const probabilities = data.probabilities;

      return (
        <div>
          <h3>Predicción: {data.class_name}</h3>
          <ul>
            {CLASS_NAMES.map((className, index) => {
              const percentage = (probabilities[index] * 100).toFixed(2);
              return (
                <li key={className} className="probability-item">
                  <div className="probability-label">{className}:</div>
                  <div className="probability-bar-container">
                    <div className="probability-bar" style={{ width: `${percentage}%` }}></div>
                  </div>
                  <div className="probability-percentage">{percentage}%</div>
                </li>
              );
            })}
          </ul>
        </div>
      );
    } catch (error) {
      console.error("Error al procesar el resultado:", error);
      return <p>Error al mostrar las probabilidades.</p>;
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start',
        gap: 64,
        marginTop: 32,
      }}
    >
      {/* Columna izquierda: uploader */}
      <div style={{ width: 400 }}>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          style={{ display: 'none' }}
          id="file-upload"
        />
        {!preview ? (
          <label
            htmlFor="file-upload"
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              border: '2px dashed #aaa',
              borderRadius: 8,
              width: 400,
              height: 400,
              padding: 0,
              cursor: 'pointer',
              background: '#fafafa',
              boxSizing: 'border-box',
            }}
          >
            <svg width="48" height="48" fill="#888" viewBox="0 0 24 24">
              <path d="M19 15v4a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-4H2l10-9 10 9h-3zm-7 4h4v-6h3l-5-4.5L5 13h3v6z"/>
            </svg>
            <span style={{ marginTop: 8, color: '#888' }}>
              Haz clic o arrastra una imagen aquí
            </span>
          </label>
        ) : (
          <div
            style={{
              marginTop: 0,
              textAlign: 'center',
              width: 400,
              height: 400,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '2px dashed #aaa',
              borderRadius: 8,
              background: '#fafafa',
              boxSizing: 'border-box',
            }}
          >
            <img
              src={preview}
              alt="Previsualización"
              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            />
          </div>
        )}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginTop: 8 }}>
          <button onClick={handleClear} disabled={!file && !preview}>
            Limpiar
          </button>
          <button onClick={handleProcess} disabled={loading}>
            {loading ? 'Procesando...' : 'Procesar'}
          </button>
        </div>
      </div>
      {/* Columna derecha: texto/resultados */}
      <div style={{ width: 550, minHeight: 450, background: '#fff', padding: 24, borderRadius: 8, boxSizing: 'border-box', border: '1px solid #eee' }}>
        <h2>Resultados</h2>
        {loading && <p>Procesando imagen...</p>}
        {!loading && result && renderProbabilities()}
        {!loading && !result && (
          <p>
            En este apartado se mostrarán los resultados correspondientes a la imagen procesada. Aquí podrás visualizar la información extraída o generada a partir de la misma.
          </p>
        )}
      </div>
    </div>
  );
};