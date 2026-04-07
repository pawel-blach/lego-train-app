import { Frame, Modal, TitleBar, Fieldset, Checkbox } from "@react95/core";
import type { BoardMode } from "../../types/track";

interface ControlsProps {
  open: boolean;
  onClose: () => void;
  boardMode: BoardMode;
  onBoardModeChange: (mode: BoardMode) => void;
  moveWholeTrack: boolean;
  onMoveWholeTrackChange: (value: boolean) => void;
}

export function Controls({
  open,
  onClose,
  boardMode,
  onBoardModeChange,
  moveWholeTrack,
  onMoveWholeTrackChange,
}: ControlsProps) {
  if (!open) return null;

  return (
    <Modal
      title="Controls"
      titleBarOptions={<TitleBar.Close onClick={onClose} />}
      style={{
        position: "absolute",
        top: 8,
        left: 260,
        zIndex: 40,
      }}
      dragOptions={{ disabled: false }}
    >
      <Fieldset legend="Left button behavior" style={{ margin: 8, width: 290 }}>
        <Frame display="flex" flexDirection="column" style={{ margin: 8 }}>
          <Checkbox
            checked={boardMode === "select"}
            onChange={() => onBoardModeChange(boardMode === "select" ? "pan" : "select")}
          >
            Select and move parts
          </Checkbox>
          <p
            style={{
              marginLeft: 22,
              marginTop: 16,
            }}
          >
            With this option enabled, left-clicking on a track piece will select
            it and allow you to move it around. If disabled, left-clicking will
            enable pan and zoom.
          </p>
          <p
            style={{
              marginLeft: 22,
              marginTop: 8,
            }}
          >
            You can also enable this setting by pressing V on your keyboard and
            disable it by pressing H.
          </p>
        </Frame>
      </Fieldset>
      <Fieldset
        legend="Element move behavior"
        style={{ margin: 8, width: 290 }}
      >
        <Frame display="flex" flexDirection="column" style={{ margin: 8 }}>
          <Checkbox
            checked={moveWholeTrack}
            onChange={() => onMoveWholeTrackChange(!moveWholeTrack)}
          >
            Move the whole track
          </Checkbox>
          <p
            style={{
              marginLeft: 22,
              marginTop: 16,
            }}
          >
            With this option enabled, moving a track piece will also move all
            pieces connected to it. If disabled, only the piece you are moving
            will be affected.
          </p>
          <p
            style={{
              marginLeft: 22,
              marginTop: 8,
            }}
          >
            You can toggle this setting by pressing D on your keyboard.
          </p>
          <p
            style={{
              marginLeft: 22,
              marginTop: 8,
            }}
          >
            You can also force this mode by clicking while holding the Alt /
            Option key, even if the option is disabled.
          </p>
        </Frame>
      </Fieldset>
    </Modal>
  );
}
