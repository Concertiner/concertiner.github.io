import {A,E,O,Q} from 'https://aeoq.github.io/AEOQ.mjs'
class Staff extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({mode: 'open'}).append(E('style', this.css), E('u', '𝄚𝄚'));
    }
    css = `
    :host {
        display:inline-block;
        font-family:bravura,sans-serif;
        padding-top:.5em; margin-top:1.2em;
        position:relative;
    }
    b,i,u,::slotted(:where(b,i)) {
        all:unset;
        &[hidden] {display:none;}
    }
    :host(staff-note:not([pitch])) :is(b,i) {display:none;}
    b,i,u::before,u::after,span,::slotted(*) {
        position:absolute;
    }
    i,u::before,u::after,span {
        left:50%; transform:translateX(-50%);
    }
    u {
        position:relative;

        &.lower::before {content:'𝄗'; top:.875em;}
        &.lower::after {bottom:1.3em;}
        &.upper::before {content:'𝄚'; bottom:1.25em;}
        &.upper::after {top:-.3em;}
        &::after {
            content:'';
            width:100%; height:calc(var(--mask)*1em); background:white;
        }
    }
    i {
        top:calc(var(--top)*1em);

        :host(.left) &,:host(.both) &:nth-of-type(2) {transform:translateX(-50%) rotate(180deg);}
        :host(:not(.both)) &:nth-of-type(2) {display:none;}
    }
    b {
        right:72%; top:calc(var(--top)*1em);
    }
    span {
        font-size:.5em; color:blue;
        top:calc(var(--top)*2em + 3.45em);

        &:nth-of-type(2),:host(.left) &:nth-of-type(1) {top:calc(var(--top)*1.9826em + 1.2696em)}
    }
    concertina-keyboard {
        font-size:.15em;
        top:-7em; left:1em;
        width:20em;
    }`;
    position = (note, octave) => .75 - .125*Note.notes.indexOf(note) - .875*(octave-4);
}
class Note extends Staff {
    constructor() {
        super();
        this.shadowRoot.append(E('style', this.css), E('slot'),
            E('b', '𝄫', {id: 'bb'}), E('b', '♭', {id: 'b'}), E('b', '♮', {id: 'n'}), E('b', '♯', {id: '#'}), E('b', '𝄪', {id: 'x'}),
            E('i', '𝅘𝅥'), E('span'), E('i', '𝅘𝅥'), E('span')
        );
    }
    set pitch(pitch) {this.setAttribute('pitch', pitch)}
    set acci(acci) {this.showAcci = acci;}
    connectedCallback() {
        (!this.getAttribute('pitch')) 
        
    }
    attributeChangedCallback(_, __, pitch) {
        Note.left.includes(Note.equivalent(pitch)) && this.classList.add('left');
        Note.both.includes(Note.equivalent(pitch)) && this.classList.add('both');
        [Note.coor[Note.equivalent(pitch)]].flat().forEach((c, i) => this.sQ(`span:nth-of-type(${i+1})`).innerText = c || '');

        this.sQ('b', b => b.hidden = true);
        pitch = Note.split(pitch);
        pitch[2] && this.showAcci !== false && (this.sQ(`b[id='${pitch[2]}']`).hidden = false);

        let top = this.position(pitch[1], pitch[3]);
        E(this).set({'--top': top});
        top >= .75 && E(this.sQ('u')).set({classList: 'lower', '--mask': Math.trunc(top/.25)*-.2+.9});
        top <= -.75 && E(this.sQ('u')).set({classList: 'upper', '--mask': Math.trunc(top/.25)*.3+1.9});
    }
    static observedAttributes = ['pitch']
    static notes = ['C','D','E','F','G','A','B']
    static split = pitch => /^([A-G])(bb|b|n|#|x)?(\d)?$/.exec(pitch)
    static equivalent = pitch => {
        pitch = Note.split(pitch);
        let i = Note.notes.indexOf(pitch[1]);
        if (pitch[2] == '#') {
            pitch[1] == 'B' && (pitch[3] &&= parseInt(pitch[3]) + 1);
            ['E','B'].includes(pitch[1]) && (pitch[1] = Note.notes.at((i + 1) % 7)) && (pitch[2] = '');
        } else if (pitch[2] == 'x') {
            pitch[1] == 'B' && (pitch[3] &&= parseInt(pitch[3]) + 1);
            pitch[2] = ['E','B'].includes(pitch[1]) ? '#' : '';
            pitch[1] = Note.notes.at((i + 1) % 7);
        } else if (pitch[2] == 'b') {
            pitch[1] == 'C' && (pitch[3] &&= parseInt(pitch[3]) - 1);
            pitch[2] = ['C','F'].includes(pitch[1]) ? '' : '#';
            pitch[1] = Note.notes.at(i - 1);
        } else if (pitch[2] == 'bb') {
            pitch[1] == 'C' && (pitch[3] &&= parseInt(pitch[3]) - 1);
            pitch[2] = ['C','F'].includes(pitch[1]) ? '#' : '';
            pitch[1] = Note.notes.at(i - (['C','F'].includes(pitch[1]) ? 2 : 1));
        }
        return pitch.slice(1,4).join('');
    }
    static left = ['A3','C4','C#4','E4','G4','A#4','B4','D5','F5','F#5','A5','C6','C#6','E6','G6','G#6','A#6','B6']
    static both = ['G#3','D#4','G#4','D#5','G#5','D#6']
    static coor = {
        G3:21, 'G#3':[11,41], A3:31, 'A#3':41, B3:31, 
        C4:21, 'C#4':11, D4:22, 'D#4':[12,42], E4:32, F4:32, 'F#4':42, G4:22, 'G#4':[13,12], A4:23, 'A#4':43, B4:33,
        C5:33, 'C#5':43, D5:23, 'D#5':[14,13], E5:24, F5:34, 'F#5':44, G5:34, 'G#5':[44,14], A5:24, 'A#5':15, B5:25,
        C6:35, 'C#6':45, D6:35, 'D#6':[45,15], E6:25, F6:26, 'F#6':16, G6:36, 'G#6':46, A6:36, 'A#6':16, B6:26, C7:27
    }
}
customElements.define('staff-note', Note);

class Key extends Staff {
    constructor() {
        super();
        this.shadowRoot.append(E('style', this.css), E('b', '𝄞', {style: {top: '.2em', left: '.1em'}}));
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
            this.shadowRoot.append(E('b', acci == '#' ? '♯' : '♭', {
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

customElements.define('concertina-staff', class extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({mode: 'open'}).append(E('style', this.css), E('slot'));
    }
    connectedCallback() {
        this.key ||= this.getAttribute('key');
        this.notes ||= this.getAttribute('notes');

        let {altered, acci} = Key.altered(this.key);
        altered = altered?.map(n => n[0]);

        this.append(
            E('staff-signature', {key: this.key}), 
            ...this.notes.split(',').map(pitch => {
                let isAltered = altered?.includes(pitch.substring(0, pitch.length - 1));
                return E('staff-note', {
                    acci: !isAltered,
                    pitch: isAltered ? pitch.replace(/\d$/, `${acci}$&`) : pitch, 
                })
            })
        );
    }
    css = `:host {display:flex; flex-wrap:wrap;}`;
});

export {Note, Key}
