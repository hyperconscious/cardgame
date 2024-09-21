const img = document.getElementById('avatar');

document.getElementById('avatarForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);

    try {
        const response = await fetch('../user/upload-avatar', {
            method: 'POST',
            body: formData,
        });

        const result = await response.json();
        if (response.ok) {
            document.getElementById('avatar').src =  `${result.avatarPath}`;
        }
    } catch (error) {
        console.error('Error uploading avatar:', error);
    }
});
