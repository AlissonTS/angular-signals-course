import {
  Component,
  computed,
  effect,
  ElementRef,
  inject,
  Injector,
  signal,
  viewChild,
} from '@angular/core';
import { CoursesService } from '../services/courses.service';
import { Course, sortCoursesBySeqNo } from '../models/course.model';
import { MatTab, MatTabGroup } from '@angular/material/tabs';
import { CoursesCardListComponent } from '../courses-card-list/courses-card-list.component';
import { MatDialog } from '@angular/material/dialog';
import { MessagesService } from '../messages/messages.service';
import { catchError, from, throwError } from 'rxjs';
import { CoursesServiceWithFetch } from '../services/courses-fetch.service';
import {
  toObservable,
  toSignal,
  outputToObservable,
  outputFromObservable,
} from '@angular/core/rxjs-interop';
import { openEditCourseDialog } from '../edit-course-dialog/edit-course-dialog.component';
import { LoadingService } from '../loading/loading.service';

@Component({
  selector: 'home',
  standalone: true,
  imports: [MatTabGroup, MatTab, CoursesCardListComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent {
  #courses = signal<Course[]>([]);

  coursesService = inject(CoursesService);

  dialog = inject(MatDialog);

  messageService = inject(MessagesService);

  beginnerCourses = computed(() => {
    const courses = this.#courses();

    return courses.filter((course) => course.category === 'BEGINNER');
  });

  advancedCourses = computed(() => {
    const courses = this.#courses();

    return courses.filter((course) => course.category === 'ADVANCED');
  });

  // beginnersList = viewChild<CoursesCardListComponent>('beginnersList');
  beginnersList = viewChild('beginnersList', {
    read: ElementRef,
  });

  constructor() {
    effect(() => {
      console.log('beginners list: ', this.beginnersList());
    });

    this.loadCourses().then(() => console.log(this.#courses()));
  }

  async loadCourses() {
    try {
      const courses = await this.coursesService.loadAllCourses();

      this.#courses.set(courses.sort(sortCoursesBySeqNo));
    } catch (error) {
      this.messageService.showMessage('Error loading courses!', 'error');
    }
  }

  onCourseUpdated(updatedCourse: Course) {
    const courses = this.#courses();

    const newCourses = courses.map((course) =>
      course.id === updatedCourse.id ? updatedCourse : course
    );

    this.#courses.set(newCourses);
  }

  async onCourseDeleted(courseId: string) {
    try {
      await this.coursesService.deleteCourse(courseId);

      const courses = this.#courses();

      const newCourses = courses.filter((course) => course.id !== courseId);

      this.#courses.set(newCourses);
    } catch (error) {
      console.error(error);
      alert('Error deleting course');
    }
  }

  async onAddCourse() {
    const newCourse = await openEditCourseDialog(this.dialog, {
      mode: 'create',
      title: 'Create new course',
    });

    if (!newCourse) {
      return;
    }

    this.#courses.update((courses) => [...courses, newCourse]);
  }
}
