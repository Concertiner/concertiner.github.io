import {A,E,O,Q} from 'https://aeoq.github.io/AEOQ.mjs'
class Flippable extends Array {
    constructor(...items) {super(...items);}
    get current() {return this;}
    get flipped() {return new Flippable(...this.map(item => item == 'L' ? 'R' : 'L'));}
}
class Keyboard extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({mode: 'open'}).append(
            E('style', Keyboard.css), 
            E('div', {id: 'L'}), E('div', {id: 'R'}),
            E('figure', [E('staff-note', {classList: 'upper lower'}), E('staff-note'), E('staff-note', {classList: 'upper lower'})])
        );
        this.sQ('#L').append(...Keyboard.left.map(n => E('b', {title: n, classList: n.replace(/\d$/,'')})));
        this.sQ('#R').append(...Keyboard.right.map(n => E('b', {title: n, classList: n.replace(/\d$/,'')})));
        this.sQ('#L b:nth-of-type(-n+6)', (b, i) => b.textContent = Keyboard.altered[0][i]);
        this.sQ('#L b:nth-last-of-type(-n+6)', (b, i) => b.textContent = Keyboard.altered[1][i]);
        this.sQ('#R b:nth-of-type(-n+6)', (b, i) => b.textContent = Keyboard.altered[2][i]);
        this.sQ('#R b:nth-last-of-type(-n+5)', (b, i) => b.textContent = Keyboard.altered[3][i]);
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
            let sq = this.sequence(key);
            sq.length > 2 && this.shadowRoot.append(
                E('p', [...sq, ...sq.slice(0,3)].join('')),
                E('p', [...sq.slice(1,3), ...sq.flipped, `[${sq[0]}]`].join(''))
            );
            while (octave <= 7) {
                sq = sq.flipped;
                Tonal.Scale.get(`${key}${octave} major`).notes.forEach((note, i) => {
                    if (octave <= 3 && parseInt(Tonal.Note.distance('G3', note)) < 0 ||
                        octave >= 6 && parseInt(Tonal.Note.distance(note, 'C7')) < 0) 
                        return;
                    this.mark(sq[i % sq.length], note, `degree-${i+1}`);
                    i == 4 && this.mark(sq[i % sq.length], Tonal.Note.transpose(note, '1A'), `degree-#5`)
                });
                octave++;
            }
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
    mark = (hand, note, clas) => {
        /B#|E#|##|b/.test(note) && (note = Tonal.Note.enharmonic(note));
        let b = this.sQ(`#${hand} b[title='${note}']`), flipped;
        b ??= (flipped = true) && this.sQ(`#${hand == 'L' ? 'R' : 'L'} b[title='${note}']`);
        b ? b.classList.add(clas, flipped ? 'flipped' : null) : console.log(hand, note);
    }
    sequence = key => 
        ['C','A','E','Eb'].includes(key) ? Keyboard.sequence.LR :
        ['G','D','F','Bb'].includes(key) ? Keyboard.sequence.LR.flipped :
        key == 'Ab' ? Keyboard.sequence.RRLL : 
        key == 'Db' ? Keyboard.sequence.RRLL.flipped : Keyboard.sequence.RLLL;
    
    static altered = [['♯','♯','♯','♭','♭','♭'],['♭','♭','♭','♯','♯','♯'],['♯','♭','♭','♭','♯','♯'],['♯','♯','♯','♯','♭']]
    static sequence = {
        LR: new Flippable('L','R'),
        RLLL: new Flippable('R','L','L','L'),
        RRLL: new Flippable('R','R','L','L'),
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
        padding:0 1em;

        &::before {
            content:attr(scale)''attr(chord); order:2;
            font-size:3em;
            width:2em;
            text-align:center;
            z-index:2;
        }
    }
    :host([chord])::before {
        font-size:2em; width:3em;
    }
    figure {
        position:absolute; top:.735em; left:50%; transform:translateX(-50%) scaleX(1.85);
        font-size:4em;
        white-space:nowrap;
        opacity:.2;
        z-index:1;
        margin:0;
    }
    div {
        display:grid; grid-template:repeat(6,2em)/repeat(4,1em); gap:0 1em;
        grid-auto-flow:column;
        position:relative;
        margin:1em 0;

        staff-note {
            position:absolute; top:.36em; left:.38em;
            transform:scaleX(2);
            font-size:4em;
            opacity:.3;
            z-index:1;
        }
    }
    #R {
        margin-bottom:0;
        order:3;
        grid-template:repeat(7,2em)/repeat(4,1em);

        staff-note {top:.485em;}
    }
    b {
        width:calc(1em/var(--f)); height:calc(1em/var(--f));
        border:calc(.1em/var(--f)) solid; border-radius:9em;
        box-sizing:border-box;
        scale:1.5;
        text-align:center; line-height:.9em;
        --f:.9; font-size:calc(var(--f)*1em);
        background:hsl(var(--h),100%,var(--b,60%));

        #L &:nth-of-type(-n+12),
        #R &:nth-of-type(n+14) {
            align-self:end;
        }
        #R &:first-of-type,
        #R &:nth-last-of-type(5) {
            grid-row-start:2;
        }
        &.degree-1 {--h:0;}
        &.degree-2 {--h:35;}
        &.degree-3 {--h:60;}
        &.degree-4 {--h:140;}
        &.degree-5 {--h:190;}
        &.degree-6 {--h:250;}
        &.degree-7 {--h:290;}
        &[class~='degree-#5'] {--h:205; --b:80%; border-style:dotted;}
        &.flipped {border-radius:0;}
        &.note {background:black;}
        &.root {background:red;}
        &.tension {background:yellow;}
        &.omit {background:silver;}
    }
    p {
        position:absolute;
        font-size:1.25em;
        padding:.1em .25em; margin:0;
        outline:.1em solid;

        &:nth-of-type(1) {
            left:41%; top:0;
            &::first-letter {color:hsl(0,100%,60%);}
        }
        &:nth-of-type(2) {
            right:41%; bottom:0;
            &::first-letter {color:hsl(250,100%,60%);}
        }
    }`
}
customElements.define('concertina-keyboard', Keyboard);
