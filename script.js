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

        $li.append($checkbox, $taskText, $deleteBtn);
        return $li;
    };

    // 모든 할 일을 화면에 표시하는 함수
    const renderTasks = () => {
        $('#taskList').empty();
        tasks.forEach(task => {
            $('#taskList').append(createTaskElement(task));
        });
    };

    // 새로운 할 일 추가
    $('#addButton').on('click', function() {
        const taskText = $('#taskInput').val().trim();
        if (taskText) {
            const newTask = {
                text: taskText,
                completed: false
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