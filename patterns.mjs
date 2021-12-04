const patternCache = {};
export const Cache = (key, sub) => {
	const okey = (typeof key) + '###' + key.toString();
	const v = patternCache[okey];
	if(v !== undefined)
		return v;
	return patternCache[okey] = sub
};

let memoizeCounter = 0;
export const Memoize = sub => {
	const cid = memoizeCounter++ + ':';
	return text =>
		text.memoization[cid + text.start] !== undefined
			? text.memoization[cid + text.start]
			: text.memoization[cid + text.start] = sub(text);
}

export const None = null;
const bindStack = [];

export const End = text => text.length == 0 ? [text, null] : None;

export const PositiveLookahead = sub =>
	text => sub(text) !== None ? [text, null] : None;

export const NegativeLookahead = sub =>
	text => sub(text) === None ? [text, null] : None;

export const Sequence = (...elems) =>
	text => {
		let list = [];
		for(const elem of elems) {
			const match = elem(text);
			if(match === None) return None;
			text = match[0];
			list.push(match[1])
		}
		return [text, list]
	};

export const LooseSequence = (...elems) =>
	Sequence(...(elems.map(IgnoreLeadingWhitespace)));

export const SavePass = sub =>
	text => {
		if(bindStack.length == 0)
			return sub(text);
		const saved = bindStack.pop();
		if(Array.isArray(saved))
			bindStack.push([ ...saved ]);
		else
			bindStack.push({ ...saved });
		const ret = sub(text);
		if(ret !== None) return ret;
		bindStack.pop();
		bindStack.push(saved);
		return None
	};

export const Choice = (...opts) =>
	text => {
		for(const opt of opts) {
			const ret = SavePass(opt)(text);
			if(ret !== None) return ret
		}
		return None
	};

export const LongestChoice = (...opts) =>
	text => {
		let match = [text, null];
		for(const opt of opts) {
			const ret = SavePass(opt)(text);
			if(ret !== None && ret[0].start > match[0].start)
				match = ret
		}
		return match[0] === text ? None : match
	};

export const Optional = sub =>
	text => SavePass(sub)(text) ?? [text, null];

export const ZeroOrMore = sub =>
	text => {
		const ssub = SavePass(sub);
		const list = [];
		while(text.length != 0) {
			const match = sub(text);
			if(match === None) break;
			text = match[0];
			list.push(match[1])
		}
		return [text, list]
	};

export const OneOrMore = sub =>
	text => {
		const ret = ZeroOrMore(sub);
		if(ret === None || ret[1].length == 0) return None;
		return ret
	};

export const Literal = val =>
	Cache(val, text => text.toString().startsWith(val) ? [text.forward(val.length), val] : None);

export const Regex = regex =>
	Cache(regex, text => {
		const match = text.toString().match(regex);
		if(match === null) return None;
		return [text.forward(match[0].length), match[0]];
	});

export const IgnoreLeadingWhitespace = sub =>
	text => {
		const match = text.toString().match(/^\s+/);
		if(match !== null)
			text = text.forward(match[0].length);
		return sub(text);
	};

export const Forward = () => {
	const func = text => func.value(text);
	func.value = null;
	return func;
};

export const Bind = (objfunc, sub) => {
	if(sub === undefined) {
		sub = objfunc;
		objfunc = () => ({})
	}
	return text => {
		let obj = objfunc();
		bindStack.push(obj);
		const ret = sub(text);
		obj = bindStack.pop();
		if(ret === None) return None;
		return [ret[0], obj]
	}
};

export const BindArray = sub => Bind(() => [], sub);

export const AddValue = sub =>
	text => {
		const ret = sub(text);
		if(ret === None) return None;
		bindStack[bindStack.length - 1].push(ret[1]);
		return ret
	};

export const Named = (name, sub) =>
	text => {
		const ret = sub(text);
		if(ret === None) return None;
		bindStack[bindStack.length - 1][name] = ret[1];
		return ret
	};

export const Transform = (func, sub) =>
	text => {
		const ret = sub(text);
		if(ret === None) return None;
		return [ret[0], func(ret[1])]
	};

export const PushValue = sub =>
	text => {
		bindStack.pop();
		const ret = sub(text);
		bindStack.push(ret === None ? undefined : ret[1]);
		return ret;
	};

export const PopValue = sub =>
	text => {
		bindStack.push(undefined);
		const ret = sub(text);
		const value = bindStack.pop();
		if(ret === None) return None;
		return [ret[0], value]
	};
