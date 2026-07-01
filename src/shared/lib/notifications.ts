export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) {
    console.warn('Este browser não suporta notificações de desktop');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  return false;
}

export async function scheduleLocalNotification(title: string, options: NotificationOptions, timestamp: number) {
  if (Notification.permission !== 'granted') return;

  const registration = await navigator.serviceWorker?.getRegistration();
  if (!registration) {
    console.warn('Nenhum Service Worker registrado para enviar notificação.');
    return;
  }

  // Verifica se a API de Trigger (Experimental) existe
  // @ts-ignore
  if ('showTrigger' in Notification.prototype && window.TimestampTrigger) {
    try {
      await registration.showNotification(title, {
        ...options,
        // @ts-ignore
        showTrigger: new TimestampTrigger(timestamp)
      });
      console.log('Notificação agendada com Trigger API para', new Date(timestamp));
      return;
    } catch (e) {
      console.warn('Erro ao usar Trigger API', e);
    }
  }

  // Fallback: usar setTimeout se o app estiver aberto (se for fechado, a notificação será perdida no iOS/Safari sem Push real)
  const delay = timestamp - Date.now();
  if (delay > 0) {
    setTimeout(() => {
      registration.showNotification(title, options);
    }, delay);
    console.log('Notificação agendada com setTimeout para', new Date(timestamp));
  } else {
    registration.showNotification(title, options);
  }
}

export async function agendarLembreteAgua(timestamp?: number) {
  // Agenda pra daqui a 2 horas, por exemplo, ou usa o timestamp providenciado
  const time = timestamp || (Date.now() + 2 * 60 * 60 * 1000);
  await scheduleLocalNotification('Hora de beber água!', {
    body: 'Mantenha-se hidratado para atingir seus objetivos.',
    icon: '/favicon.svg'
  }, time);
}

export async function agendarLembreteRefeicao(nomeRefeicao: string, time: number) {
  await scheduleLocalNotification(`Lembrete: ${nomeRefeicao}`, {
    body: `Não se esqueça de registrar seu ${nomeRefeicao} no diário!`,
    icon: '/favicon.svg'
  }, time);
}
