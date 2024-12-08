class Weather {
    constructor(weatherType, start=0, end=-1) {
        this.weatherType = weatherType;
        this.start = start;
        this.end = end;
    }

    frameInWeather(frame) {
        return frame >= start && (frame <= end || end < 0);
    }
}