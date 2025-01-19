export class UilibColors {
  public colors = [
    { name: 'primary0', value: 'var(--primary0)' },
    { name: 'primary', value: 'var(--primary)' },
    { name: 'primary1', value: 'var(--primary1)' },
    { name: 'primary2', value: 'var(--primary2)' },
    { name: 'primaryDark0', value: 'var(--primaryDark0)' },
    { name: 'primaryDark', value: 'var(--primaryDark)' },
    { name: 'primaryDark1', value: 'var(--primaryDark1)' },
    { name: 'primaryDark2', value: 'var(--primaryDark2)' },
    { name: 'secondaryLight0', value: 'var(--secondaryLight0)' },
    { name: 'secondaryLight', value: 'var(--secondaryLight)' },
    { name: 'secondaryLight1', value: 'var(--secondaryLight1)' },
    { name: 'secondaryLight2', value: 'var(--secondaryLight2)' },
    { name: 'secondary', value: 'var(--secondary)' },
    { name: 'black0', value: 'var(--black0)' },
    { name: 'black', value: 'var(--black)' },
    { name: 'black05', value: 'var(--black05)' },
    { name: 'black1', value: 'var(--black1)' },
    { name: 'white0', value: 'var(--white0)' },
    { name: 'white', value: 'var(--white)' },
    { name: 'white1', value: 'var(--white1)' },
    { name: 'grey0', value: 'var(--grey0)' },
    { name: 'grey', value: 'var(--grey)' },
    { name: 'grey1', value: 'var(--grey1)' },
    { name: 'red', value: 'var(--red)' },
    { name: 'orange', value: 'var(--orange)' },
    { name: 'orange1', value: 'var(--orange1)' },
  ];

  public generateColorElements() {
    return this.colors.map(color => {
      const div = document.createElement('div');
      div.className = `color-box color-${color.name}`;
      div.style.backgroundColor = color.value;
      div.textContent = color.name;
      return div;
    });
  }
}
