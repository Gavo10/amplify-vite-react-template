import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { generateClient } from 'aws-amplify/data';
import { useAuthenticator } from '@aws-amplify/ui-react';
import type { Schema } from '../amplify/data/resource';

const client = generateClient<Schema>();

function LungClassifier() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [predictions, setPredictions] = useState<Record<string, number> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/predict';

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPredictions(null);
      setError(null);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append('file', selectedFile);

    setLoading(true);
    setError(null);
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Error al procesar la imagen. Intenta nuevamente.');
      }

      const result = await response.json();
      setPredictions(result);
    } catch (error: any) {
      setError(error.message || 'Error inesperado.');
      setPredictions(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">LungAI: Clasificador de Tejido Pulmonar</h1>
      <p className="mb-4">
        Sube una imagen CT de pulmón para clasificarla en una de las 5 categorías:
        Adenocarcinoma, Carcinoma de Células Grandes, Normal, No Tumor, Carcinoma de Células Escamosas.
      </p>

      <input type="file" accept="image/*" onChange={handleFileChange} className="mb-4" />

      {imagePreview && (
        <div className="mb-4">
          <img src={imagePreview} alt="Vista previa" className="w-full rounded border" />
        </div>
      )}

      <button
        onClick={handleSubmit}
        className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
        disabled={!selectedFile || loading}
      >
        {loading ? 'Analizando...' : 'Clasificar Imagen'}
      </button>

      {error && (
        <div className="mt-4 text-red-600 font-semibold">{error}</div>
      )}

      {predictions && (
        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-2">Predicciones:</h2>
          <ul className="list-disc list-inside">
            {Object.entries(predictions).map(([label, score]) => (
              <li key={label}>
                {label}: {(score * 100).toFixed(2)}%
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function TodosApp() {
  const { signOut } = useAuthenticator();
  const [todos, setTodos] = useState<Array<Schema["Todo"]["type"]>>([]);

  useEffect(() => {
    client.models.Todo.observeQuery().subscribe({
      next: (data) => setTodos([...data.items]),
    });
  }, []);

  function createTodo() {
    const content = window.prompt("Contenido del TODO");
    if (content) client.models.Todo.create({ content });
  }

  function deleteTodo(id: string) {
    client.models.Todo.delete({ id });
  }

  return (
    <main className="p-4 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Mis Tareas</h1>
      <button onClick={createTodo} className="bg-green-600 text-white px-4 py-2 rounded mb-4">+ Nueva</button>
      <ul>
        {todos.map((todo) => (
          <li
            onClick={() => deleteTodo(todo.id)}
            key={todo.id}
            className="cursor-pointer hover:text-red-600"
          >
            {todo.content}
          </li>
        ))}
      </ul>
      <div className="mt-6">
        <p>
          🥳 App corriendo. Crea una tarea o visita el clasificador.
        </p>
        <Link to="/clasificador" className="text-blue-500 underline">
          Ir al Clasificador Pulmonar
        </Link>
      </div>
      <button onClick={signOut} className="mt-4 text-red-600 underline">Cerrar sesión</button>
    </main>
  );
}

export default function App() {
  return (
    <Router>
      <nav className="p-4 bg-gray-100 flex gap-4">
        <Link to="/">Todos</Link>
        <Link to="/clasificador">Clasificador</Link>
      </nav>
      <Routes>
        <Route path="/" element={<TodosApp />} />
        <Route path="/clasificador" element={<LungClassifier />} />
      </Routes>
    </Router>
  );
}
