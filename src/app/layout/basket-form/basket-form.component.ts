import { Component, EventEmitter, Output } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { ButtonComponent } from "../../components/button/button.component";
import { InputComponent } from "../../components/input/input.component";
import { FileInputComponent } from "../../components/file-input/file-input.component";

@Component({
  selector: "app-basket-form",
  standalone: true,
  imports: [FormsModule, ButtonComponent, InputComponent, FileInputComponent],
  templateUrl: "./basket-form.component.html",
  styleUrl: "./basket-form.component.scss",
})
export class BasketFormComponent {
  @Output() tagsChange = new EventEmitter<string[]>();
  @Output() ingredientsChange = new EventEmitter<string[]>();
  inputTitle: string = "";
  inputDescription: string = "";
  tags: string[] = [];
  inputTagValue: string = "";
  ingredients: string[] = [];
  inputIngredientValue: string = "";

  addTag() {
    if (
      this.inputTagValue.trim() &&
      !this.tags.includes(this.inputTagValue.trim())
    ) {
      this.tags.push(this.inputTagValue.trim());
      this.inputTagValue = "";
      this.emitTags();
    }
  }

  removeTag(index: number) {
    this.tags.splice(index, 1);
    this.emitTags();
  }

  emitTags() {
    this.tagsChange.emit([...this.tags]);
  }

  addIngredient() {
    if (
      this.inputIngredientValue.trim() &&
      !this.ingredients.includes(this.inputIngredientValue.trim())
    ) {
      this.ingredients.push(this.inputIngredientValue.trim());
      this.inputIngredientValue = "";
      this.emitIngredients();
    }
  }

  removeIngredient(index: number) {
    this.ingredients.splice(index, 1);
    this.emitIngredients();
  }

  emitIngredients() {
    this.ingredientsChange.emit([...this.ingredients]);
  }
}
