import { Frame, Modal, TitleBar, Fieldset, Checkbox } from "@react95/core";

interface ControlsProps {
  open: boolean;
  onClose: () => void;
}

export function Controls({ open, onClose }: ControlsProps) {
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
          <Checkbox readOnly>Select and move parts</Checkbox>
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
            You can also change this setting by pressing S on your keyboard.
          </p>
        </Frame>
      </Fieldset>
    </Modal>
  );
}
