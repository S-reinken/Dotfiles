#
# ~/.bashrc
#

# If not running interactively, don't do anything
[[ $- != *i* ]] && return

alias ls='ls --color=auto'
alias startwk="sudo openvpn ~/Work/VPNConfig/sreinken.ovpn"
alias schoolsrv="ssh -l sreinke2 bfx.aap.jhu.edu"

export PROMPT_DIRTRIM=3

PS1="\[\e[0;32m\]\u\[\e[m\] \[\e[1;34m\]\w\[\e[m\] \n\[\e[1;32m\]\$\[\e[m\] "
