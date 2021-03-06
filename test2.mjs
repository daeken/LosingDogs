import * as p from './patterns.mjs'
import { Bobbin } from './bobbin.mjs'

const text = new Bobbin(`
user Daeken:
- Likes cats
- Dislikes JavaScript

user Dogken:- Likes dogs
-Dislikes fetch()
`)

const ident = p.Regex(/^[a-z][a-z0-9]*/i)
const about = p.PopValue(p.LooseSequence(p.Literal('-'), p.PushValue(p.Transform(x => x.trim(), p.Regex(/^[^\r\n]+\s*\n/)))))
const user = p.Bind(p.Sequence(p.Regex(/^\s*user\s+/), p.Named('name', ident), p.Regex(/^\s*:\s*/), p.Named('about', p.ZeroOrMore(about))))
const grammar = p.PopValue(p.Sequence(p.PushValue(p.ZeroOrMore(user)), p.End))

const res = grammar(text)
if(res === p.None)
	console.log('Parsing failed!')
else
	console.log(JSON.stringify(res[1], null, '\t'))

/*

[
        {
                "name": "Daeken",
                "about": [
                        "Likes cats",
                        "Dislikes JavaScript"
                ]
        },
        {
                "name": "Dogken",
                "about": [
                        "Likes dogs",
                        "Dislikes fetch()"
                ]
        }
]

*/
