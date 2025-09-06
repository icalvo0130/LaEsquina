function selectRole(role) {
    // Guardar el rol seleccionado en localStorage
    localStorage.setItem('selectedRole', role);
    
    // Redirigir a la app correspondiente
    switch(role) {
        case 'consumer':
            window.location.href = '/consumer-app/';
            break;
        case 'store':
            window.location.href = '/store-app/';
            break;
        case 'delivery':
            window.location.href = '/delivery-app/';
            break;
        default:
            console.error('Rol no válido');
    }
}
