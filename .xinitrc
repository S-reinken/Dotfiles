restore_alsa() {
  while [ -z "$(pidof pulseaudio)" ]; do
    sleep 0.5
  done
  alsactl -f /vae/lib/alsa/asound.state restore
}
restore_also &

[[ -f ~/.Xresources ]] && xrdb -merge -I$HOME ~/.Xresources
systemctl --user import-environment DISPLAY

[ ! -s ~/.config/mpd/pid ] && mpd

#exec startfluxbox
~/.fehbg &
exec i3
