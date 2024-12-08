class Weather {
    constructor(weatherType, start=0, end=-1) {
        this.weatherType = weatherType;
        this.start = start;
        this.end = end;
    }

    frameInWeather(frame) {
        return frame >= this.start && (frame <= this.end || this.end < 0);
    }
}