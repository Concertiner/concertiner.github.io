import {A,E,O,Q} from 'https://aeoq.github.io/AEOQ.mjs'
class Keyboard extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({mode: 'open'}).append(E('style', Keyboard.css), E('div', {id: 'L'}), E('div', {id: 'R'}));
        this.sQ('#L').append(...Keyboard.left.map(n => E('b', {title: n, classList: n.replace(/\d$/,'')})));
        this.sQ('#R').append(...Keyboard.right.map(n => E('b', {title: n, classList: n.replace(/\d$/,'')})));
    }
    connectedCallback() {
        ['scale','chord'].forEach(which => {
            let what = this[which] ?? this.getAttribute(which);
            what && this.show[which](what);
        });
    }
    show = {
        scale: key => {
            let octave = ['G','A','B'].includes(key.includes('b') ? Tonal.Note.enharmonic(key)[0] : key[0]) ? 2 : 3;
            let looped = 1;
            while (octave <= 7) {
                Tonal.Scale.get(`${key}${octave} major`).notes.forEach((note, i) => {
                    if (octave <= 3 && parseInt(Tonal.Note.distance('G3', note)) < 0 ||
                        octave >= 6 && parseInt(Tonal.Note.distance(note, 'C7')) < 0) 
                        return;
                    /B#|E#|##|b/.test(note) && (note = Tonal.Note.enharmonic(note));
                    let cycle = this.cycle(key)[looped % 2];
                    let b = this.sQ(`#${cycle[i % cycle.length]} b[title='${note}']`);
                    b && (b.style.background = `hsl(${Keyboard.scale.hues[i]},100%,50%)`);
                });
                octave++;
                looped++;
            }
            this.exception(key);
            this.setAttribute('scale', key.replace('#','♯').replace('b','♭'));
        },
        chord: key => {
            let extensible = /major|minor|domin/.exec(key)?.[0];
            let extended = extensible ? key.replace(extensible, Keyboard.chord.extend[extensible]) : null;
            Tonal.Chord.get(extended || key).notes.forEach((note, i) => {
                /B#|E#|##|b/.test(note) && (note = Tonal.Note.enharmonic(note));
                [this.sQ(`b[class~='${note}']`)].flat()
                .forEach(b => b.classList.add(extended ? Keyboard.chord.notes[extensible][i] : i === 0 ? 'root' : 'note'));
            });
            let chord = Tonal.Chord.get(extended || key);
            this.setAttribute('chord', chord.tonic + (chord.aliases.find(a => /^[Δø+\d]/.test(a)) || chord.aliases[0]));
        }
    }
    exception = key => key == 'Eb' && E(this.sQ(`#L b[title='G#6']`)).set({style: {borderRadius: 0, background: `hsl(140,100%,50%)`}});
    cycle = key => {
        if (['C','A','E','Eb'].includes(key)) return Keyboard.scale.pendulum;
        if (['G','D','F','Bb'].includes(key)) return Keyboard.scale.pendulum.toReversed();
        let sequence = 
            key == 'Ab' ? Keyboard.scale.cycle2 : 
            key == 'Db' ? Keyboard.scale.cycle2.toReversed() : Keyboard.scale.cycle1;
        return this.setAttribute('sequence', sequence[0].join(' ')) || sequence;
    }
    static scale = {
        pendulum: [['L','R'],['R','L']],
        cycle1: [['R','L','L','L'],['L','R','R','R']],
        cycle2: [['R','R','L','L'],['L','L','R','R']],
        hues: [0,35,60,140,190,250,290]
    }
    static chord = {
        extend: {
            major: 'maj13#11',
            minor: 'm13'
        },
        notes: {
            major: ['root','note','omit','note','tension','tension','tension'],
            minor: ['root','note','omit','note','tension','tension','tension']
        }
    }
    static left = ['G#6','C#6','F#5','A#4','D#4','G#3','G6','C6','F5','B4','E4','A3','B6','E6','A5','D5','G4','C4','A#6','D#6','G#5','D#5','G#4','C#4']
    static right = ['F#6','A#5','D#5','G#4','D#4','G#3','C7','F6','B5','E5','A4','D4','G3','A6','D6','G5','C5','F4','B3','D#6','G#5','C#5','F#4','A#3']
    static css = `
    :host {
        display:inline-flex; align-items:center;
        position:relative;
        padding:1em 1em 0 1em;

        &::before {
            content:attr(scale)''attr(chord); order:2;
            font-size:3em;
            width:2em;
            text-align:center;
        }
        &::after {
            content:attr(sequence);
            position:absolute; left:46%; top:5%;
            font-size:1.5em;
        } 
    }
    :host([chord])::before {
        font-size:2em; width:3em;
    }
    div {
        display:grid; grid-template:repeat(6,2em)/repeat(4,1em); gap:0 1em;
        grid-auto-flow:column;
    }
    #R {
        order:3;
        grid-template:repeat(7,2em)/repeat(4,1em);
    }
    b {
        width:1em; height:1em;
        border:.1em solid; border-radius:9em;
        box-sizing:border-box;
        scale:1.5;

        #L &:nth-of-type(-n+12),
        #R &:nth-of-type(n+14) {
            align-self:end;
        }
        #R &:first-of-type,
        #R &:nth-last-of-type(5) {
            grid-row-start:2;
        }
        &.note {background:black;}
        &.root {background:red;}
        &.tension {background:yellow;}
        &.omit {background:silver;}
    }`
}
customElements.define('concertina-keyboard', Keyboard);
