import "./style.css";
import van from "vanjs-core";
import { MessageBoard } from "vanjs-ui";

export class Toast {
  board: MessageBoard;
  constructor(parent: HTMLElement) {
    const root = van.tags.div({ class: "root" });
    van.add(parent, root);
    this.board = new MessageBoard(
      {
        boardClass: "board",
        messageClass: "message",
      },
      root,
    );
  }

  show(props: { label: string; sec?: number }) {
    this.board.show({
      message: props.label,
      durationSec: props.sec || 3,
    });
  }
}
