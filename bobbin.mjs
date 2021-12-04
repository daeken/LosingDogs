export class Bobbin {
	constructor(text, start = -1, end = -1) {
		if(text instanceof Bobbin) {
			this.text = text.text;
			this.memoization = text.memoization;
			this.start = start == -1 ? text.start : start;
			this.end = end == -1 ? text.end : end;
		} else {
			this.text = text;
			this.memoization = {};
			this.start = start == -1 ? 0 : start;
			this.end = end == -1 ? text.length : end;
		}
		this.length = this.end - this.start;
		this.totalLength = this.text.length;
	}

	forward(count) { return new Bobbin(this, this.start + count) }

	peek(count = 1) {
		return this.text.substring(this.start, this.start + count)
	}

	toString() { return this.start == 0 && this.length == this.totalLength ? this.text : this.text.substring(this.start, this.end) }
}
