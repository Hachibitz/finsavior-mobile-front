export function generateUsernameFromEmail(email: string): string {
    return email.split('@')[0].replace(/[^a-zA-Z0-9]/g, '') + Date.now();
}

export function extractFirstName(fullName: string): string {
    return fullName.split(' ')[0];
}

export function extractLastName(fullName: string): string {
    const parts = fullName.split(' ');
    return parts.length > 1 ? parts.slice(1).join(' ') : 'Sobrenome';
}

export function generateStrongPassword(): string {
    const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lower = 'abcdefghijklmnopqrstuvwxyz';
    const nums = '0123456789';
    const special = '@$!%*?&';
    const all = upper + lower + nums + special;

    let password = 
        upper[Math.floor(Math.random() * upper.length)] +
        lower[Math.floor(Math.random() * lower.length)] +
        nums[Math.floor(Math.random() * nums.length)] +
        special[Math.floor(Math.random() * special.length)];

    while (password.length < 12) {
        password += all[Math.floor(Math.random() * all.length)];
    }

    return password.split('').sort(() => Math.random() - 0.5).join('');
}