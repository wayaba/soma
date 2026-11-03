import moment from 'moment';

export function getDateTimeFormated(date: string | Date | undefined) {
    if (!date) return '—';
    let i = new Date(date);
    return moment(i).format('DD/MM/YYYY HH:mm:ss');
}

export function getDuracion(inicio: string | Date, fin: string | Date) {
    const startDate = moment(inicio);
    const timeEnd = moment(fin);
    const diff = timeEnd.diff(startDate);
    const diffDuration = moment.duration(diff);
    let mins =
        diffDuration.hours() * 60 +
        diffDuration.minutes() +
        parseFloat((diffDuration.seconds() / 60).toFixed(1));
    return mins;
}
