import app from 'flarum/admin/app';

app.initializers.add('flectar/flarum-fancybox', () => {
  app.extensionData.for('flectar-fancybox').registerSetting({
    setting: 'flectar-fancybox.excerpt_enabled',
    label: 'Enable Fancybox in Discussion List Excerpts',
    type: 'boolean',
  });
});
