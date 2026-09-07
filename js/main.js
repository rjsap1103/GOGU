// DOM이 완전히 로드된 후 실행
document.addEventListener('DOMContentLoaded', () => {
    console.log('웹사이트가 성공적으로 로드되었습니다.');

    const exploreBtn = document.getElementById('exploreBtn');
    if (exploreBtn) {
        exploreBtn.addEventListener('click', () => {
            const aboutSection = document.getElementById('about');
            if (aboutSection) {
                aboutSection.scrollIntoView({ behavior: 'smooth' });
            }
        });
    }
});
