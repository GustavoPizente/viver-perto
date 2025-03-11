import React, { useState } from "react";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import axios from "axios";
import "leaflet/dist/leaflet.css";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.REACT_APP_OPENAI_API_KEY || "", // Verifique se a chave está correta
  dangerouslyAllowBrowser: true,
});

const BuscaPraia = ({ lat, lon }: { lat: number; lon: number }) => {
  const map = useMap();
  
  // Move o mapa até a cidade com animação
  map.flyTo([lat, lon], 12, {
    animate: true,
    duration: 2,
  });
  return <Marker position={[lat, lon]} />;
};

const Mapa = () => {
  const [praia, setPraia] = useState("");
  const [coords, setCoords] = useState(null as { lat: number; lon: number } | null);
  const [respostaAI, setRespostaAI] = useState("");
  const [cidadeMaisProxima, setCidadeMaisProxima] = useState("");

  // Função para buscar coordenadas da cidade
  const buscarCoordenadas = async () => {
    try {
      const response = await axios.get(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(praia)}`
      );

      if (response.data.length > 0) {
        const { lat, lon } = response.data[0];
        setCoords({ lat: parseFloat(lat), lon: parseFloat(lon) });
        console.log(`Cidade localizada: ${praia} - Latitude: ${lat}, Longitude: ${lon}`);
        gerarRespostaAI(praia);
      } else {
        alert("Cidade não encontrada.");
      }
    } catch (error) {
      console.error("Erro ao buscar coordenadas:", error);
    }
  };

  // Função para gerar a resposta da IA com o poema e última palavra como cidade mais próxima
  const gerarRespostaAI = async (cidade: string) => {
    try {
      console.log("Chamando OpenAI com a cidade:", cidade); // Log para depuração
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        store: true,
        messages: [
          { role: "user", content: `Escreva um poema zen de  4 linhas sobre a cidade litorânea mais proxima da cidade de ${cidade}. envie o nome dessa cidade ao final dentro de () Só vale cidades Brasileiras do sul do país, se não for o nome de uma cidade litoranea brasileira dentro de () pode refazer. se esse nome dentro de () for uma palavra composta deve ser unido por -` },
        ],
      });

      // Verifique se o formato da resposta está correto
      console.log("Resposta da IA:", response);

      const poema = response?.choices?.[0]?.message?.content?.trim();
      if (poema) {
        setRespostaAI(poema);
        
        // Extrair a última palavra (cidade mais próxima)
        const palavras = poema.split(" ");
        const ultimaPalavra = palavras[palavras.length - 1]; // Última palavra do poema
        setCidadeMaisProxima(ultimaPalavra);
        console.log("Última palavra extraída:", ultimaPalavra); // Log para depuração

        // Buscar coordenadas da cidade mais próxima
        buscarCoordenadasCidadeProxima(ultimaPalavra);
      } else {
        console.error("Nenhuma resposta válida foi recebida da OpenAI.");
      }
    } catch (error) {
      console.error("Erro ao gerar resposta da IA:", error);
    }
  };

  // Função para buscar as coordenadas da cidade mais próxima
  const buscarCoordenadasCidadeProxima = async (cidade: string) => {
    try {
      console.log("Buscando coordenadas para cidade mais próxima:", cidade); // Log para depuração
      const response = await axios.get(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(cidade)}`
      );

      if (response.data.length > 0) {
        const { lat, lon } = response.data[0];
        setCoords({ lat: parseFloat(lat), lon: parseFloat(lon) });
        console.log(`Cidade mais próxima: ${cidade} - Latitude: ${lat}, Longitude: ${lon}`);
      } else {
        console.error("Cidade mais próxima não encontrada.");
      }
    } catch (error) {
      console.error("Erro ao buscar coordenadas da cidade mais próxima:", error);
    }
  };

  return (
    <div>
      <h2>Digite o nome da cidade onde você mora:</h2>
      <input
        type="text"
        value={praia}
        onChange={(e) => setPraia(e.target.value)}
        placeholder="Ex: Copacabana"
      />
      <button onClick={buscarCoordenadas}>Buscar</button>

      <MapContainer center={[-25, -50]} zoom={5} style={{ height: "500px", width: "100%" }} id="map">
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {coords && <BuscaPraia lat={coords.lat} lon={coords.lon} />}
      </MapContainer>

      <div>
        {respostaAI && (
          <>
            <h3>Que tal viver na praia?</h3>
            <p>{respostaAI}</p>
            <p>conheça as opções</p>
          </>
        )}
        
      </div>
    </div>
  );
};

export default Mapa;
