export function message(text: string) {
    console.log(text);
    window['stl'].console =+ text;
}