Les couleurs par défaut du theme sont renseignés dans le fichier de configuration, via la props theme.
définie tel que : 

{
    theme : {
        light : {
            primary:
            secondary,
            ....[reste des couleurs light par défaut à appliquer  au theme]
        },
        dark : {
            primary:
            secondary,
            ....[reste des couleurs dark par défaut à appliquer au theme en mode sombre]
        }
    }
}