#
# ~/.bashrc
#

# If not running interactively, don't do anything
[[ $- != *i* ]] && return

alias ls='ls --color=auto'
alias startwk="sudo openvpn ~/Work/VPNConfig/sreinken.ovpn"
alias schoolsrv="ssh -l sreinke2 bfx.aap.jhu.edu"
alias install="sudo pacman -S"
alias x="startx"
alias v="vim"
alias vk="sudo killall openvpn"
alias spow="systemctl poweroff"

TERM='xterm-256color'

#powerline-daemon -q
#POWERLINE_BASH_CONTINUATION=1
#POWERLINE_BASH_SELECT=1
#. /usr/share/powerline/bindings/bash/powerline.sh

export PROMPT_DIRTRIM=3

PS1="\[\e[0;32m\]\u\[\e[m\] \[\e[1;34m\]\w\[\e[m\] \n\[\e[1;32m\]\$\[\e[m\] "
