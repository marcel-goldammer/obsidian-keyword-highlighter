export class CheckboxComponent {
  #container: HTMLElement;
  #element: HTMLInputElement | null = null;
  #label?: string;
  #state = false;
  #onClick: (newState: boolean) => void = () => {};

  constructor(container: HTMLElement) {
    this.#container = container;
  }

  setLabel(label: string): this {
    this.#label = label;
    this.render();
    return this;
  }

  setState(newState: boolean): this {
    this.#state = newState;
    this.render();
    return this;
  }

  setOnClick(action: (state: boolean) => void): this {
    this.#onClick = action;
    this.render();
    return this;
  }

  render(): void {
    if (this.#element) {
      this.#container.removeChild(this.#element);
    }
    this.#element = this.#container.createEl("input");
    this.#element.type = "checkbox";
    if (this.#label) {
      this.#element.title = this.#label;
    }
    this.#element.checked = this.#state;
    this.#element.classList.add("kh-checkbox");
    this.#element.onclick = () => {
      this.#state = !this.#state;
      this.#onClick(this.#state);
    };
  }
}
