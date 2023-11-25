type OptionsType = Record<string, string>;

export class ToggleButtonComponent {
  #container: HTMLElement;
  #group: HTMLSpanElement | null = null;
  #options: OptionsType;
  #state: string[] = [];
  #onOptionClick: (newState: string[]) => void;

  constructor(container: HTMLElement) {
    this.#container = container;
  }

  setOptions(options: OptionsType): this {
    this.#options = options;
    this.renderOptions();
    return this;
  }

  setState(newState: string[]): this {
    this.#state = newState;
    this.renderOptions();
    return this;
  }

  setOnOptionClick(action: (newState: string[]) => void): this {
    this.#onOptionClick = action;
    this.renderOptions();
    return this;
  }

  renderOptions(): void {
    if (this.#group) {
      this.#container.removeChild(this.#group);
    }
    this.#group = this.#container.createSpan();
    this.#group.classList.add("kh-toggle-group");
    for (const key of Object.keys(this.#options)) {
      this.createOptionButton(key, this.#group);
    }
  }

  private createOptionButton(
    key: string,
    parent: HTMLElement
  ): HTMLButtonElement {
    const optionButton = parent.createEl("button");
    optionButton.innerHTML = this.#options[key];
    if (this.#state.contains(key)) {
      optionButton.classList.add("kh-toggle--checked");
    }
    optionButton.onclick = () => {
      this.toggleState(key);
      optionButton.classList.toggle("kh-toggle--checked");
      this.#onOptionClick(this.#state);
    };
    return optionButton;
  }

  toggleState(key: string): void {
    if (this.#state.contains(key)) {
      this.#state = this.#state.filter((v) => v !== key);
    } else {
      this.#state = [...this.#state, key];
    }
  }
}
