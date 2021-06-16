export const textMatcher =
  (targetText: string) => (content: string, element: HTMLElement) => {
    const hasText = (node: Element) => node.textContent === targetText;
    const nodeHasText = hasText(element);

    const childrenDontHaveText = Array.from(element.children).every(
      (child) => !hasText(child)
    );

    return childrenDontHaveText && nodeHasText;
  };
