import { useState } from "react";
import { Modal, TitleBar, Frame, Input, Button } from "@react95/core";

interface AddBudgetModalProps {
  onConfirm: (name: string, color: string, pieces: Record<string, number>) => void;
  onCancel: () => void;
}

const COLOR_PRESETS = [
  "#FF5722", "#E91E63", "#9C27B0", "#3F51B5",
  "#2196F3", "#009688", "#4CAF50", "#FF9800",
  "#795548", "#607D8B",
];

const PIECE_FIELDS = [
  { id: "straight16", label: "Straight 16" },
  { id: "straight4", label: "Straight 4" },
  { id: "curveR40L", label: "Curve Left" },
  { id: "curveR40R", label: "Curve Right" },
  { id: "switchL", label: "Switch Left" },
  { id: "switchR", label: "Switch Right" },
] as const;

export function AddBudgetModal({ onConfirm, onCancel }: AddBudgetModalProps) {
  const [name, setName] = useState("");
  const [color, setColor] = useState(COLOR_PRESETS[0]);
  const [counts, setCounts] = useState<Record<string, number>>({
    straight16: 0,
    straight4: 0,
    curveR40L: 0,
    curveR40R: 0,
    switchL: 0,
    switchR: 0,
  });

  const handleCountChange = (id: string, value: string) => {
    const num = Math.max(0, parseInt(value) || 0);
    setCounts((prev) => ({ ...prev, [id]: num }));
  };

  const handleConfirm = () => {
    if (!name.trim()) return;
    onConfirm(name.trim(), color, counts);
  };

  return (
    <Modal
      title="Add Budget"
      titleBarOptions={<TitleBar.Close onClick={onCancel} />}
      style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        zIndex: 50,
        width: 280,
      }}
    >
      <Frame
        boxShadow="in"
        bg="white"
        style={{ padding: 8, display: "flex", flexDirection: "column", gap: 8 }}
      >
        <div>
          <label style={{ display: "block", marginBottom: 2, fontWeight: "bold" }}>Name</label>
          <Input
            value={name}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
            style={{ width: "100%" }}
          />
        </div>

        <div>
          <label style={{ display: "block", marginBottom: 2, fontWeight: "bold" }}>Color</label>
          <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
            {COLOR_PRESETS.map((c) => (
              <button
                key={c}
                onClick={() => setColor(c)}
                style={{
                  width: 20,
                  height: 20,
                  backgroundColor: c,
                  border: c === color ? "2px solid black" : "1px solid #999",
                  cursor: "pointer",
                  padding: 0,
                }}
              />
            ))}
          </div>
        </div>

        {PIECE_FIELDS.map(({ id, label }) => (
          <div key={id} style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <label style={{ flex: 1 }}>{label}</label>
            <Input
              type="number"
              min={0}
              value={String(counts[id])}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleCountChange(id, e.target.value)}
              style={{ width: 60 }}
            />
          </div>
        ))}

        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 4 }}>
          <Button onClick={handleConfirm}>OK</Button>
          <Button onClick={onCancel}>Cancel</Button>
        </div>
      </Frame>
    </Modal>
  );
}
