import { Canvas } from "@react-three/fiber";
import { Text3D, Center } from "@react-three/drei";
import { useRef, useEffect, useState } from "react";
import { useFrame } from "@react-three/fiber";
import {
  Group,
  Mesh,
  BufferGeometry,
  MeshStandardMaterial,
  DirectionalLight,
  DoubleSide,
  Box3,
  Vector3,
} from "three";
import { DeckStatusDisplay } from "./components/DeckStatus";
import type { DeckStatus } from "./types/deck";
import "./App.css";
import { ShaderArtBackground } from "./components/ShaderArtBackground";
import { Environment } from "@react-three/drei";
import { useCrossfader } from "./hooks/useCrossfader";

function PulsingLight({ bpm }: { bpm: number }) {
  const lightRef = useRef<DirectionalLight>(null);
  const time = useRef(0);
  const lastBpm = useRef(bpm);

  useEffect(() => {
    time.current = 0;
    lastBpm.current = bpm;
  }, [bpm]);

  useFrame((state) => {
    if (lightRef.current) {
      const beatDuration = 60 / lastBpm.current;
      time.current += state.clock.getDelta();
      const pulse = Math.sin((time.current / beatDuration) * Math.PI * 2);
      lightRef.current.intensity = 1 + pulse * 1;
    }
  });

  return <directionalLight ref={lightRef} position={[0, 0, 5]} intensity={2} />;
}

function RotatingText({ bpm }: { bpm: number }) {
  const groupRef = useRef<Group>(null);
  const textRef = useRef<Mesh<BufferGeometry, MeshStandardMaterial>>(null);
  const time = useRef(0);
  const lastBpm = useRef(bpm);

  useEffect(() => {
    time.current = 0;
    lastBpm.current = bpm;
  }, [bpm]);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.005;
      const beatDuration = 60 / lastBpm.current;
      time.current += state.clock.getDelta();
      const bounce = Math.sin((time.current / beatDuration) * Math.PI * 2);
      groupRef.current.position.y = bounce * 0.2;
    }
  });

  return (
    <group ref={groupRef}>
      <Center scale={1}>
        <Text3D
          ref={textRef}
          font="/HelveticaforTarget-Bold_Bold.json"
          size={2.5}
          height={1}
          curveSegments={24}
          letterSpacing={-0.1}
          lineHeight={0.6}
          bevelEnabled
          bevelThickness={0.2}
          bevelSize={0.05}
          bevelSegments={10}
        >
          {`20\nfor\n20`}
          <meshStandardMaterial
            color="#ffffff"
            metalness={0.9}
            roughness={0.1}
            envMapIntensity={2}
            side={DoubleSide}
          />
        </Text3D>
      </Center>
    </group>
  );
}

function App() {
  const [deckStatuses, setDeckStatuses] = useState<Record<number, DeckStatus>>(
    {}
  );
  const [wsConnected, setWsConnected] = useState(false);
  const [currentBpm, setCurrentBpm] = useState<number>(120);
  const {
    showLeftDeck,
    showRightDeck,
    isConnected: crossfaderConnected,
  } = useCrossfader();

  useEffect(() => {
    console.log("BPM changed to:", currentBpm);
  }, [currentBpm]);

  useEffect(() => {
    let ws: WebSocket | null = null;
    let reconnectTimeout: ReturnType<typeof setTimeout>;

    const connectWebSocket = () => {
      ws = new WebSocket("ws://localhost:8080/track-status");

      ws.onopen = () => {
        console.log("WebSocket connected");
        setWsConnected(true);
      };

      ws.onmessage = (event) => {
        try {
          const data: DeckStatus = JSON.parse(event.data);
          if (data && data.deck && data.track) {
            setDeckStatuses((prev) => ({
              ...prev,
              [data.deck]: data,
            }));
          }
        } catch (error) {
          console.error("Error parsing WebSocket message:", error);
        }
      };

      ws.onerror = (error) => {
        console.error("WebSocket error:", error);
        setWsConnected(false);
      };

      ws.onclose = () => {
        console.log("WebSocket disconnected, attempting to reconnect...");
        setWsConnected(false);
        reconnectTimeout = setTimeout(connectWebSocket, 3000);
      };
    };

    connectWebSocket();

    return () => {
      if (ws) {
        ws.close();
      }
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
      }
    };
  }, []);

  return (
    <div className="app-container">
      <ShaderArtBackground />
      <Canvas camera={{ position: [25, 0, 25], fov: 40 }}>
        <Environment preset="warehouse" />
        <ambientLight intensity={0.25} />
        <PulsingLight bpm={currentBpm} />
        <directionalLight position={[5, 0, 5]} intensity={1} />
        <directionalLight position={[-5, 0, 5]} intensity={1} />
        <RotatingText bpm={currentBpm} />
      </Canvas>
      {wsConnected && (
        <DeckStatusDisplay
          deckStatuses={Object.fromEntries(
            Object.entries(deckStatuses).filter(
              ([deck]) =>
                (Number(deck) === 1 && showLeftDeck) ||
                (Number(deck) === 2 && showRightDeck)
            )
          )}
          onBpmChange={setCurrentBpm}
        />
      )}
    </div>
  );
}

export default App;
