/**
 * A class for log message
 */
export class Log {
  text = 'N/A';
  id;
  color;
  time;
  status;

  producer;

  constructor(text, id, color, time, producer, status) {
    if (text) this.text = text;
    else this.text = '';
    if (id) this.id = id;
    else this.id = this.generateNewId();
    if (color) this.color = color;
    else this.color = this.generateRandomColor();
    if (time) this.time = time;
    else this.time = new Date();
    if (producer && (typeof producer.id === 'string' || typeof producer.id === 'number')) this.producer = producer;
    else this.producer = { id: 'N/A' };
    if (status) this.status = status;
    else this.status = {};
  }

  generateNewId() {
    return Math.floor(Math.random() * 10000000542310);
  }

  generateRandomColor() {
    let red = 255 * Math.random();
    let green = 255 * Math.random();
    let blue = 255 * Math.random();
    let alpha = Math.random() + 0.2;
    return 'rgba(' + red + ',' + green + ',' + blue + ',' + alpha + ')';
  }
}
