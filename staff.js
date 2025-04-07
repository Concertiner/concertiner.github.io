import {A,E,O,Q} from 'https://aeoq.github.io/AEOQ.mjs'
class Staff extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({mode: 'open'}).append(E('link', {rel: 'stylesheet', href: './staff.css'}), E('u', '𝄚𝄚', {part: 'u'}));
    }
    position = (note, octave) => .25 - .125 * Staff.notes.indexOf(note) - .875 * (octave - 4);
    static notes = ['C','D','E','F','G','A','B']
}
class Note extends Staff {
    constructor() {
        super();
    }
    connectedCallback() {
        this.getAttribute('notes')?.split(' ').forEach(note => {
            let [value, pitch] = note.split('/');
            if (pitch === '0')
                return this.shadowRoot.append(E('b', Note.rest[value]));
            pitch = Note.split(pitch);
            let top = this.position(pitch[1], pitch[3]);
            pitch[2] && this.showAcci !== false && this.shadowRoot.append(E('i', Note.accidental[pitch[2]], {'--top': top, part: 'i'}));
            this.shadowRoot.append(E('b', Note.value[value] ?? value, {'--top': top, part: 'b'}));
        });
    }
    static value = {4: '𝅝', 2: '𝅗𝅥', 1: '𝅘𝅥', .5: '𝅘𝅥𝅮', .25: '𝅘𝅥𝅯'}
    static rest = {4: '𝄻', 2: '𝄼', 1: '𝄽', .5: '𝄾', .25: '𝄿'}
    static accidental = {bb: '𝄫', b: '♭', n: '♮', '#': '♯', x: '𝄪'}
    static split = pitch => /^([A-G])(bb|b|n|#|x)?(\d)?$/.exec(pitch)
}
customElements.define('staff-note', Note);

class Key extends Staff {
    constructor() {
        super();
        this.shadowRoot.append(E('style', this.css), E('i', '𝄞', {style: {top: '-.3em', left: '.1em'}}));
    }
    set key(key) {this.setAttribute('key', key)}
    attributeChangedCallback(_, __, key) {
        let {altered, acci} = Key.altered(key);
        let pure = altered?.map(p => Note.split(p)[1]) ?? [];
        let notes = [...Note.notes.filter(n => !pure.includes(n)), ...pure.map(n => Note.equivalent(n + acci))];
        this.shadowRoot.append(new Keyboard(notes, {key}));
        if (!altered) return;

        this.sQ('u').innerText += [...Array(Math.ceil(altered.length/2))].map(_ => this.sQ('u').innerText.substring(0,2)).join('');
        altered.forEach((pitch, i) => {
            pitch = Note.split(pitch);    
            this.shadowRoot.append(E('i', acci == '#' ? '♯' : '♭', {
                '--top': this.position(pitch[1], pitch[3]), 
                style: {left: `${(i+1)/4 + .6}em`}
            }));
        });
    }
    static observedAttributes = ['key']
    static sharp = ['G','D','A','E','B','F#','C#']
    static flat = ['F','Bb','Eb','Ab','Db','Gb','Cb']
    static '#' = ['F5','C5','G5','D5','A4','E5','B4']
    static 'b' = ['B4','E5','A4','D5','G4','C5','F4']
    static altered = key => {
        let amount, acci;
        (amount = Key.sharp.indexOf(key) + 1) && (acci = '#');
        amount || (amount = Key.flat.indexOf(key) + 1) && (acci = 'b');
        return {altered: Key[acci]?.slice(0, amount), acci}
    }
}
customElements.define('staff-signature', Key);

export {Note, Key}
