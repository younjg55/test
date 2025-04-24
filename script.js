$(document).ready(function() {
    // 현재 날짜 표시
    const today = new Date();
    const dateString = today.getFullYear() + '.' + 
                      String(today.getMonth() + 1).padStart(2, '0') + '.' + 
                      String(today.getDate()).padStart(2, '0');
    $('#currentDate').text(dateString);

    // localStorage에서 할 일 목록 불러오기
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

    // 할 일 목록을 localStorage에 저장하는 함수
    const saveTasks = () => {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    };

    // 새로운 할 일 요소를 생성하는 함수
    const createTaskElement = (task) => {
        const $li = $('<li>').addClass('task-item');

        const $checkbox = $('<div>')
            .addClass('checkbox')
            .toggleClass('checked', task.completed)
            .on('click', function() {
                task.completed = !task.completed;
                $(this).toggleClass('checked');
                saveTasks();
            });

        const $taskText = $('<span>')
            .addClass('task-text')
            .text(task.text);

        const $dateText = $('<span>')
            .addClass('date-text')
            .text(new Date(task.createdDate).toLocaleString('ko-KR', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
            }));

        const $deleteBtn = $('<button>')
            .addClass('delete-btn')
            .html('×')
            .on('click', function() {
                tasks = tasks.filter(t => t !== task);
                $li.fadeOut(300, function() {
                    $(this).remove();
                    saveTasks();
                });
            });

        $li.append($checkbox, $taskText, $dateText, $deleteBtn);
        return $li;
    };

    // 페이징 관련 변수
    let currentPage = 1;
    const itemsPerPage = 5;

    // 페이지 정보 업데이트 함수
    const updatePageInfo = (totalPages) => {
        $('#pageInfo').text(`${currentPage} / ${totalPages}`);
        $('#prevPage').prop('disabled', currentPage === 1);
        $('#nextPage').prop('disabled', currentPage === totalPages);
    };

    // 모든 할 일을 화면에 표시하는 함수
    const renderTasks = () => {
        $('#taskList').empty();
        const currentFilter = $('.tab-button.active').data('filter');
        
        const filteredTasks = tasks.filter(task => {
            if (currentFilter === 'active') return !task.completed;
            if (currentFilter === 'completed') return task.completed;
            return true; // 'all'인 경우
        });

        const totalPages = Math.ceil(filteredTasks.length / itemsPerPage);
        currentPage = Math.min(currentPage, Math.max(1, totalPages));
        
        if (filteredTasks.length === 0) {
            $('#emptyMessage').show();
            $('.pagination').hide();
        } else {
            $('#emptyMessage').hide();
            $('.pagination').show();
            
            const startIndex = (currentPage - 1) * itemsPerPage;
            const endIndex = startIndex + itemsPerPage;
            const tasksToShow = filteredTasks.slice(startIndex, endIndex);

            tasksToShow.forEach(task => {
                $('#taskList').append(createTaskElement(task));
            });
        }

        updatePageInfo(totalPages);
    };

    // 이전 페이지 버튼 클릭 이벤트
    $('#prevPage').on('click', function() {
        if (currentPage > 1) {
            currentPage--;
            renderTasks();
        }
    });

    // 다음 페이지 버튼 클릭 이벤트
    $('#nextPage').on('click', function() {
        const currentFilter = $('.tab-button.active').data('filter');
        const filteredTasks = tasks.filter(task => {
            if (currentFilter === 'active') return !task.completed;
            if (currentFilter === 'completed') return task.completed;
            return true;
        });
        const totalPages = Math.ceil(filteredTasks.length / itemsPerPage);
        
        if (currentPage < totalPages) {
            currentPage++;
            renderTasks();
        }
    });

    // 탭 버튼 클릭 이벤트
    $('.tab-button').on('click', function() {
        $('.tab-button').removeClass('active');
        $(this).addClass('active');
        currentPage = 1; // 탭 변경 시 첫 페이지로 이동
        renderTasks();
    });

    // 새로운 할 일 추가
    $('#addButton').on('click', function() {
        const taskText = $('#taskInput').val().trim();
        if (taskText) {
            const newTask = {
                text: taskText,
                completed: false,
                createdDate: new Date().toISOString()
            };
            tasks.push(newTask);
            $('#taskList').append(createTaskElement(newTask));
            $('#taskInput').val('');
            saveTasks();
        }
    });

    // Enter 키로 할 일 추가
    $('#taskInput').on('keypress', function(e) {
        if (e.key === 'Enter') {
            $('#addButton').click();
        }
    });

    // 초기 할 일 목록 표시
    renderTasks();
}); 