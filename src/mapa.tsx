import React, { useState } from "react";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import axios from "axios";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import OpenAI from "openai";
import { motion } from "framer-motion";

const openai = new OpenAI({
  apiKey: process.env.REACT_APP_OPENAI_API_KEY || "", // Verifique se a chave está correta
  dangerouslyAllowBrowser: true,
});

// Define o ícone manualmente
const customIcon = new L.Icon({
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  iconSize: [25, 41], // Tamanho do ícone
  iconAnchor: [12, 41], // Ponto de ancoragem
  popupAnchor: [1, -34],
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  shadowSize: [41, 41],
});

const BuscaPraia = ({ lat, lon }: { lat: number; lon: number }) => {
  const map = useMap();

  // Move o mapa até a cidade com animação
  map.flyTo([lat, lon], 12, {
    animate: true,
    duration: 2,
  });
  return <Marker position={[lat, lon]} icon={customIcon} />;
};

const Mapa = () => {
  const [praia, setPraia] = useState("");
  const [coords, setCoords] = useState(
    null as { lat: number; lon: number } | null
  );
  const [respostaAI, setRespostaAI] = useState("");
  const [cidadeMaisProxima, setCidadeMaisProxima] = useState("");

  // Função para buscar coordenadas da cidade
  const buscarCoordenadas = async () => {
    try {
      const response = await axios.get(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          praia
        )}`
      );

      if (response.data.length > 0) {
        const { lat, lon } = response.data[0];
        setCoords({ lat: parseFloat(lat), lon: parseFloat(lon) });
        console.log(
          `Cidade localizada: ${praia} - Latitude: ${lat}, Longitude: ${lon}`
        );
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
          {
            role: "user",
            content: `Escreva um poema zen de 4 linhas sobre a cidade litorânea mais proxima da cidade de ${cidade}. envie o nome dessa cidade ao final dentro de () Só vale cidades Brasileiras do sul do país, se não for o nome de uma cidade litoranea brasileira dentro de () refaça. se esse nome dentro de () for uma palavra composta deve ser unido por -`,
          },
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
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          cidade
        )}`
      );

      if (response.data.length > 0) {
        const { lat, lon } = response.data[0];
        setCoords({ lat: parseFloat(lat), lon: parseFloat(lon) });
        console.log(
          `Cidade mais próxima: ${cidade} - Latitude: ${lat}, Longitude: ${lon}`
        );
      } else {
        console.error("Cidade mais próxima não encontrada.");
      }
    } catch (error) {
      console.error(
        "Erro ao buscar coordenadas da cidade mais próxima:",
        error
      );
    }
  };

  const fecharRespostas = () => {
    setRespostaAI("");
  };

  return (
    <div  className="main">

        <div className="header>">
                <h2 id="h2todosqueremos">todos queremos</h2>
                 <h1 id="h1">Viver Perto</h1>

                    <h2 id="h2daquilo"> daquilo que nos faz bem</h2>



 
        </div>

        <img src="/SOL.png"  className="sol"></img>


        <div className="entradas">

      <h2>Digite o nome da cidade onde você mora:</h2>
      <input
        type="text"
        value={praia}
        onChange={(e) => setPraia(e.target.value)}
        placeholder="Ex: Copacabana"
      />
      <button onClick={buscarCoordenadas}>Buscar</button>

      </div>

      <MapContainer
        center={[-25, -50]}
        zoom={5}
        id="map"
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {coords && <BuscaPraia lat={coords.lat} lon={coords.lon} />}
      </MapContainer>

      <a href="https://www.linkedin.com/in/gustavo-pizente-nazarine-69b6812b7/" target="_blank" className="contato">
  Contato
</a>

      <div>
        {respostaAI && (
          <motion.div
            className="apiresponse"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <h2>{respostaAI}</h2>
            <h3>que tal viver mais perto da praia?</h3>

            <div className="fotosimoveis">
              <img src="/garden2.webp" alt="Imagem 1" />
              <img src="/garden.jpeg" alt="Imagem 2" />
              <img src="/piscina.jpeg" alt="Imagem 3" />
            </div>

            <p>Encontre Opções de casas</p>
            <button className="cliqueaqui" onClick={() => alert("Link da Empresa")}>
              {" "}
              Clique Aqui{" "}
            </button>
            <button className="botaofechar" onClick={fecharRespostas}>
              {" "}
              X{" "}
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Mapa;
