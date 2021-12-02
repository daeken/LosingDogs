import * as p from './patterns.mjs'
import { Bobbin } from './bobbin.mjs'

const text = new Bobbin('foo omg (bar baz) hax')

const ws = p.Regex(/^\s+/)
const ident = p.AddValue(p.Regex(/^[a-z][a-z0-9]*/i))
const elem = p.Forward()
const elemList = p.Bind([], p.Sequence(p.Optional(ws), elem, p.ZeroOrMore(p.Sequence(ws, elem)), p.Optional(ws)))
const group = p.Sequence(p.Literal('('), p.AddValue(elemList), p.Literal(')'))
elem.value = p.Choice(ident, group)
const grammar = p.Sequence(elemList, p.End)

const res = grammar(text)
if(res === p.None)
	console.log('Parsing failed!')
else
	console.log(JSON.stringify(res[1][0], null, '\t'))
