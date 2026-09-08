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

    // BEER 페이지 맥주 카드 카테고리 필터링
    const beerFilterBtns = document.querySelectorAll('.beer-filter-btn');
    const beerCards = document.querySelectorAll('.beer-cards-grid .beer-card');

    if (beerFilterBtns.length > 0 && beerCards.length > 0) {
        beerFilterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                beerFilterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                const filter = btn.getAttribute('data-filter');

                beerCards.forEach(card => {
                    const category = card.getAttribute('data-category');
                    if (filter === 'all' || category === filter) {
                        card.classList.remove('is-hidden');
                    } else {
                        card.classList.add('is-hidden');
                    }
                });
            });
        });
    }

    // GALLERY 페이지 탭 전환 (이미지 1번 버튼 vs 영상 2번 버튼)
    const galleryTabBtns = document.querySelectorAll('.gallery-tab-btn');
    const galleryImageView = document.getElementById('gallery-image-view');
    const galleryVideoView = document.getElementById('gallery-video-view');

    if (galleryTabBtns.length > 0 && galleryImageView && galleryVideoView) {
        galleryTabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                // 활성화 클래스 토글
                galleryTabBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                // 탭 데이터에 따라 이미지 또는 영상 출력
                const tab = btn.getAttribute('data-tab');
                if (tab === 'image') {
                    galleryImageView.classList.remove('is-hidden');
                    galleryImageView.classList.add('active');
                    galleryVideoView.classList.add('is-hidden');
                    galleryVideoView.classList.remove('active');
                } else if (tab === 'video') {
                    galleryVideoView.classList.remove('is-hidden');
                    galleryVideoView.classList.add('active');
                    galleryImageView.classList.add('is-hidden');
                    galleryImageView.classList.remove('active');
                }
            });
        });
    }

    // GALLERY 페이지 이미지 클릭 시 모달 팝업 (#000000 80% 배경)
    const galleryModal = document.getElementById('gallery-modal');
    const galleryModalImg = document.getElementById('gallery-modal-img');
    const galleryModalTag = document.getElementById('gallery-modal-tag');
    const galleryModalTitle = document.getElementById('gallery-modal-title');
    const galleryModalClose = document.querySelector('.gallery-modal-close');
    const galleryModalBackdrop = document.querySelector('.gallery-modal-backdrop');
    const galleryFrames = document.querySelectorAll('.gallery-frame');

    if (galleryModal && galleryModalImg && galleryFrames.length > 0) {
        // 모달 열기
        galleryFrames.forEach(frame => {
            frame.addEventListener('click', () => {
                const img = frame.querySelector('.gallery-img');
                const tag = frame.querySelector('.frame-tag');
                const title = frame.querySelector('.frame-title');

                if (img) {
                    galleryModalImg.src = img.src;
                    galleryModalImg.alt = img.alt || '확대 이미지';
                    if (galleryModalTag) galleryModalTag.textContent = tag ? tag.textContent : '';
                    if (galleryModalTitle) galleryModalTitle.textContent = title ? title.textContent : '';

                    galleryModal.classList.add('is-open');
                    galleryModal.setAttribute('aria-hidden', 'false');
                    document.body.style.overflow = 'hidden'; // 배경 스크롤 방지
                }
            });
        });

        // 모달 닫기
        const closeGalleryModal = () => {
            galleryModal.classList.remove('is-open');
            galleryModal.setAttribute('aria-hidden', 'true');
            document.body.style.overflow = '';
        };

        if (galleryModalClose) {
            galleryModalClose.addEventListener('click', closeGalleryModal);
        }
        if (galleryModalBackdrop) {
            galleryModalBackdrop.addEventListener('click', closeGalleryModal);
        }

        // ESC 키로 모달 닫기
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && galleryModal.classList.contains('is-open')) {
                closeGalleryModal();
            }
        });
    }

    // BEER 페이지 맥주 카드 클릭 시 맥주 상세 정보 모달 팝업
    const beerModal = document.getElementById('beer-modal');
    const beerModalFileTitle = document.getElementById('beer-modal-file-title');
    const beerModalImg = document.getElementById('beer-modal-img');
    const beerModalColorDot = document.getElementById('beer-modal-color-dot');
    const beerModalColorName = document.getElementById('beer-modal-color-name');
    const beerModalSubhead = document.getElementById('beer-modal-subhead');
    const beerModalTitle = document.getElementById('beer-modal-title');
    const beerModalDescTitle = document.getElementById('beer-modal-desc-title');
    const beerModalSpecAbv = document.getElementById('beer-modal-spec-abv');
    const beerModalSpecIbu = document.getElementById('beer-modal-spec-ibu');
    const beerModalSpecExtra = document.getElementById('beer-modal-spec-extra');
    const beerModalClose = document.querySelector('.beer-modal-close');
    const beerModalBackdrop = document.querySelector('.beer-modal-backdrop');
    const beerCardsList = document.querySelectorAll('.beer-card');

    const beerDetailsData = {
        lager: {
            fileTitle: 'PRODUCT FILE - KOREAN LAGER',
            image: './assets/images/LAGER BEER MOCKUP.jpeg',
            colorDot: '#DDB86C',
            colorName: '라이트 골드 - BEER COLOR',
            subhead: 'SIGNATURE',
            title: 'GOGU LAGER',
            descTitle: '곡우 라거 • Korean Highland Helles',
            abv: '5.2%',
            ibu: '18',
            extra: 'HELLES',
            flavor: [82, 38, 24, 30],
            story: '첫 모금에 투명한 탄산감이 지나가고, 겉보리 특유의 고소한 단맛이 짧게 남습니다.<br>끝은 미련 없이 깨끗하게 잘려 나가는, 식탁을 위한 라거입니다.'
        },
        ale: {
            fileTitle: 'PRODUCT FILE - KOREAN PALE ALE',
            image: './assets/images/PALE ALE MOCKUP.jpeg',
            colorDot: '#FB9F03',
            colorName: '앰버 골드 - BEER COLOR',
            subhead: 'SIGNATURE',
            title: 'GOGU PALE ALE',
            descTitle: '곡우 페일 에일 • Korean Pale Ale',
            abv: '5.8%',
            ibu: '35',
            extra: 'PALE ALE',
            flavor: [65, 45, 70, 55],
            story: '감귤과 자몽의 화사한 시트러스 아로마 뒤로 솔잎의 상쾌함이 스칩니다.<br>기분 좋은 쌉싸름함이 입안을 정돈하는 페일 에일입니다.'
        },
        dark: {
            fileTitle: 'PRODUCT FILE - KOREAN DARK ALE',
            image: './assets/images/DARK BEER MOCKUP.jpeg',
            colorDot: '#2F1105',
            colorName: '딥 블랙 - BEER COLOR',
            subhead: 'SIGNATURE',
            title: 'GOGU DARK ALE',
            descTitle: '곡우 흑맥주 • Korean Dark Ale',
            abv: '6.5%',
            ibu: '28',
            extra: 'DARK ALE',
            flavor: [40, 68, 55, 78],
            story: '볶은 보리와 맥아의 묵직한 카카오 풍미, 은은하게 퍼지는 흑당의 단맛이<br>긴 여운을 남기는 깊고 짙은 흑맥주입니다.'
        },
        seasonal: {
            fileTitle: 'PRODUCT FILE - SEASONAL • AUTUMN',
            image: './assets/images/감맥주 콘셉트 이미지 3ㄷ4.jpeg',
            colorDot: '#F0B41D',
            colorName: '어텀 골드 - BEER COLOR',
            subhead: 'SEASONAL',
            title: 'GOGU AUTUMN',
            descTitle: '곡우 어텀 에일 • Autumn Persimmon Ale',
            abv: '5.2%',
            ibu: '15',
            extra: 'PERSIMMON',
            flavor: [50, 75, 30, 65],
            story: '군산 곶감의 달콤한 농후함과 시나몬의 따스한 온기.<br>가을의 정취를 잔 속에 그대로 빚어낸 한정 맥주입니다.'
        }
    };

    if (beerModal && beerCardsList.length > 0) {
        const bar1 = document.getElementById('beer-flavor-bar-1');
        const bar2 = document.getElementById('beer-flavor-bar-2');
        const bar3 = document.getElementById('beer-flavor-bar-3');
        const bar4 = document.getElementById('beer-flavor-bar-4');
        const num1 = document.getElementById('beer-flavor-val-1');
        const num2 = document.getElementById('beer-flavor-val-2');
        const num3 = document.getElementById('beer-flavor-val-3');
        const num4 = document.getElementById('beer-flavor-val-4');
        const storyDesc = document.getElementById('beer-modal-story-desc');

        beerCardsList.forEach(card => {
            card.addEventListener('click', () => {
                const beerKey = card.getAttribute('data-beer') || 'lager';
                const data = beerDetailsData[beerKey] || beerDetailsData.lager;

                if (beerModalFileTitle) beerModalFileTitle.textContent = data.fileTitle;
                if (beerModalImg) {
                    beerModalImg.src = data.image;
                    beerModalImg.alt = data.title;
                }
                if (beerModalColorDot) beerModalColorDot.style.backgroundColor = data.colorDot;
                if (beerModalColorName) beerModalColorName.textContent = data.colorName;
                if (beerModalSubhead) beerModalSubhead.textContent = data.subhead;
                if (beerModalTitle) beerModalTitle.textContent = data.title;
                if (beerModalDescTitle) beerModalDescTitle.textContent = data.descTitle;
                if (beerModalSpecAbv) beerModalSpecAbv.textContent = data.abv;
                if (beerModalSpecIbu) beerModalSpecIbu.textContent = data.ibu;
                if (beerModalSpecExtra) beerModalSpecExtra.textContent = data.extra;

                // FLAVER PROFILE 막대 및 수치 업데이트
                if (data.flavor) {
                    if (bar1) bar1.style.width = data.flavor[0] + '%';
                    if (bar2) bar2.style.width = data.flavor[1] + '%';
                    if (bar3) bar3.style.width = data.flavor[2] + '%';
                    if (bar4) bar4.style.width = data.flavor[3] + '%';
                    if (num1) num1.textContent = data.flavor[0];
                    if (num2) num2.textContent = data.flavor[1];
                    if (num3) num3.textContent = data.flavor[2];
                    if (num4) num4.textContent = data.flavor[3];
                }

                // 설명문 업데이트
                if (storyDesc && data.story) {
                    storyDesc.innerHTML = data.story;
                }

                beerModal.classList.add('is-open');
                beerModal.setAttribute('aria-hidden', 'false');
                document.body.style.overflow = 'hidden';
            });
        });

        const closeBeerModal = () => {
            beerModal.classList.remove('is-open');
            beerModal.setAttribute('aria-hidden', 'true');
            document.body.style.overflow = '';
        };

        if (beerModalClose) {
            beerModalClose.addEventListener('click', closeBeerModal);
        }
        if (beerModalBackdrop) {
            beerModalBackdrop.addEventListener('click', closeBeerModal);
        }

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && beerModal.classList.contains('is-open')) {
                closeBeerModal();
            }
        });
    }
});
