/**
 * A class for log message
 * 
 * The log has text, id, color, time and status object
 * Each log has also producer information if it's originally from an agent
 */
export class Log {

  // Content of log
  text = 'N/A';
  // Id of log
  id;
  // Log's color (left div)
  color;
  // Time when log is created
  time;
  // If log is command, the status has information whether command is run successfully
  status;

  // Has id property for recognizing the author of the log (agent)
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

  /**
   * Generates random integer number
   * @return {number} random integer number
   */
  generateNewId() {
    return Math.floor(Math.random() * 10000000542310);
  }

  /**
   * Returns random color for style-attribute
   * @return {string} rgba(number, number, number, number)
   */
  generateRandomColor() {
    let red = 255 * Math.random();
    let green = 255 * Math.random();
    let blue = 255 * Math.random();
    let alpha = Math.random() + 0.2;
    return 'rgba(' + red + ',' + green + ',' + blue + ',' + alpha + ')';
  }
}
